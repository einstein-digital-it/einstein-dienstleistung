<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ContractCancellation;
use App\Models\CustomerRequest;
use App\Models\CustomerSupportRequest;
use App\Models\Notification;
use App\Models\Offer;
use App\Models\PriceGroup;
use App\Models\PriceItem;
use App\Models\Review;
use App\Models\SeoSetting;
use App\Models\Service;
use App\Models\ServiceExtension;
use App\Models\ServiceProvider;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * MCP server (Model Context Protocol, Streamable HTTP, stateless) for managing
 * EinStein content and requests from Claude.
 *
 * Endpoint:  POST /api/mcp/{secret}
 * The secret is MCP_SECRET in .env. Without it the endpoint answers 404.
 * Add the full URL as a custom connector in Claude (Settings > Connectors).
 */
class McpController extends Controller
{
    private const PROTOCOL_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];

    /**
     * Every resource Claude may work with.
     *  - writable: fields that may be created/updated ('*' = all fillable fields)
     *  - create / delete: whether those operations are allowed
     *  - search: columns used by the free-text `search` argument
     */
    private const RESOURCES = [
        'bookings' => [
            'model' => Booking::class,
            'about' => 'Customer bookings (incl. Dokumenten-Abo subscriptions, category "dokumentabo"). Cancel by setting status "cancelled" instead of deleting.',
            'writable' => ['status', 'payment_status', 'price', 'date', 'time', 'address', 'description', 'provider_id', 'provider_name', 'invoice_url', 'required_documents_hint', 'duration_hours', 'service_name', 'category', 'customer_name', 'customer_email', 'customer_phone'],
            'create' => true, 'delete' => false,
            'search' => ['booking_number', 'customer_name', 'customer_email', 'service_name', 'category'],
        ],
        'services' => [
            'model' => Service::class,
            'about' => 'Services shown on the website/app (names and descriptions in de/ar/en).',
            'writable' => '*', 'create' => true, 'delete' => true,
            'search' => ['name', 'name_de', 'name_ar', 'name_en', 'category'],
        ],
        'price_groups' => [
            'model' => PriceGroup::class,
            'about' => 'One price group per service category (e.g. "dokumentabo", "eur1", "forms"). Its price_items are the prices shown on the website and app; the first item is the main price.',
            'writable' => '*', 'create' => true, 'delete' => true,
            'search' => ['category'],
        ],
        'price_items' => [
            'model' => PriceItem::class,
            'about' => 'Individual price lines inside a price group (label, price, unit). price_group_id links to price_groups.',
            'writable' => '*', 'create' => true, 'delete' => true,
            'search' => ['label', 'unit'],
        ],
        'offers' => [
            'model' => Offer::class,
            'about' => 'Offer packages on the Offers page (texts in de/ar/en; features/examples/prices are JSON).',
            'writable' => '*', 'create' => true, 'delete' => true,
            'search' => ['package_key', 'title_de', 'title_ar', 'title_en'],
        ],
        'reviews' => [
            'model' => Review::class,
            'about' => 'Customer reviews. Approve or reject with status.',
            'writable' => ['status', 'comment'], 'create' => false, 'delete' => true,
            'search' => ['reviewer_name', 'reviewer_email', 'comment', 'category'],
        ],
        'support_requests' => [
            'model' => CustomerSupportRequest::class,
            'about' => 'Messages sent through the customer-service form.',
            'writable' => ['status', 'priority'], 'create' => false, 'delete' => false,
            'search' => ['name', 'email', 'subject', 'message', 'request_type'],
        ],
        'customer_requests' => [
            'model' => CustomerRequest::class,
            'about' => 'Customer service requests handled by the team.',
            'writable' => ['status', 'assigned_to', 'price', 'date', 'time', 'description'], 'create' => false, 'delete' => false,
            'search' => ['request_number', 'customer_name', 'customer_email', 'service_name'],
        ],
        'service_extensions' => [
            'model' => ServiceExtension::class,
            'about' => 'Extra work requested on an existing booking.',
            'writable' => ['status', 'payment_status'], 'create' => false, 'delete' => false,
            'search' => [],
        ],
        'providers' => [
            'model' => ServiceProvider::class,
            'about' => 'Service providers (applications and approved providers).',
            'writable' => ['status', 'notes', 'categories', 'hourly_rate', 'login_enabled', 'city', 'service_area', 'languages'], 'create' => false, 'delete' => false,
            'search' => ['full_name', 'email', 'city'],
        ],
        'cancellations' => [
            'model' => ContractCancellation::class,
            'about' => 'Cancellations submitted via "Verträge hier kündigen" (§ 312k BGB). Must be confirmed to the customer in text form without delay.',
            'writable' => ['status'], 'create' => false, 'delete' => false,
            'search' => ['name', 'email', 'reference_number'],
        ],
        'seo_settings' => [
            'model' => SeoSetting::class,
            'about' => 'SEO title/description/keywords per page (de/ar/en).',
            'writable' => '*', 'create' => true, 'delete' => false,
            'search' => ['page_name'],
        ],
        'notifications' => [
            'model' => Notification::class,
            'about' => 'In-app notifications. Use send_notification to create one.',
            'writable' => ['is_read'], 'create' => false, 'delete' => false,
            'search' => ['user_email', 'type', 'title_de', 'title_en'],
        ],
        'users' => [
            'model' => User::class,
            'about' => 'User accounts (read-only).',
            'writable' => [], 'create' => false, 'delete' => false,
            'search' => ['name', 'email'],
        ],
    ];

    public function handle(Request $request, string $secret): JsonResponse|Response
    {
        $expected = (string) config('services.mcp.secret');
        if ($expected === '' || ! hash_equals($expected, $secret)) {
            abort(404);
        }

        if ($request->isMethod('get') || $request->isMethod('delete')) {
            return response('', 405, ['Allow' => 'POST']);
        }

        $payload = json_decode($request->getContent(), true);
        if (! is_array($payload)) {
            return response()->json($this->error(null, -32700, 'Parse error'), 400);
        }

        // JSON-RPC batch or single message
        $isBatch = array_is_list($payload);
        $messages = $isBatch ? $payload : [$payload];
        $responses = [];
        foreach ($messages as $message) {
            $reply = $this->dispatch(is_array($message) ? $message : []);
            if ($reply !== null) {
                $responses[] = $reply;
            }
        }

        if ($responses === []) {
            return response('', 202); // only notifications were sent
        }

        return response()->json($isBatch ? $responses : $responses[0]);
    }

    private function dispatch(array $msg): ?array
    {
        $id = $msg['id'] ?? null;
        $method = $msg['method'] ?? '';
        $params = $msg['params'] ?? [];
        $isNotification = ! array_key_exists('id', $msg);

        try {
            $result = match ($method) {
                'initialize' => $this->initialize($params),
                'ping' => (object) [],
                'tools/list' => ['tools' => $this->tools()],
                'tools/call' => $this->callTool($params['name'] ?? '', $params['arguments'] ?? []),
                default => $isNotification ? null : throw new \BadMethodCallException("Method not found: {$method}"),
            };
        } catch (\BadMethodCallException $e) {
            return $this->error($id, -32601, $e->getMessage());
        } catch (Throwable $e) {
            Log::error('MCP error', ['method' => $method, 'error' => $e->getMessage()]);

            return $isNotification ? null : $this->error($id, -32603, 'Internal error: '.$e->getMessage());
        }

        if ($isNotification) {
            return null;
        }

        return ['jsonrpc' => '2.0', 'id' => $id, 'result' => $result];
    }

    private function initialize(array $params): array
    {
        $requested = $params['protocolVersion'] ?? self::PROTOCOL_VERSIONS[0];

        return [
            'protocolVersion' => in_array($requested, self::PROTOCOL_VERSIONS, true) ? $requested : self::PROTOCOL_VERSIONS[0],
            'capabilities' => ['tools' => ['listChanged' => false]],
            'serverInfo' => ['name' => 'einstein-admin', 'version' => '1.0.0'],
            'instructions' => 'Admin tools for EinStein (website + mobile app share this backend). '
                .'Call describe_resources first to see resources and fields. Texts usually exist in _de, _ar and _en variants; keep all three in sync. '
                .'Prices shown on the website/app come from price_groups/price_items by category. '
                .'Before changing or deleting anything, state what will change; prefer setting status over deleting.',
        ];
    }

    private function tools(): array
    {
        $resourceEnum = array_keys(self::RESOURCES);
        $resource = ['type' => 'string', 'enum' => $resourceEnum, 'description' => 'Resource name (see describe_resources)'];

        return [
            [
                'name' => 'describe_resources',
                'description' => 'List all manageable resources with their fields, writable fields, allowed operations and status values. Call this first.',
                'inputSchema' => ['type' => 'object', 'properties' => (object) []],
                'annotations' => ['readOnlyHint' => true],
            ],
            [
                'name' => 'overview',
                'description' => 'Dashboard summary: open bookings, unpaid bookings, new cancellations, open support requests, pending reviews and provider applications.',
                'inputSchema' => ['type' => 'object', 'properties' => (object) []],
                'annotations' => ['readOnlyHint' => true],
            ],
            [
                'name' => 'list_records',
                'description' => 'List records of a resource, newest first. Optional exact-match filters (e.g. {"status":"pending"}) and free-text search.',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'resource' => $resource,
                        'filters' => ['type' => 'object', 'description' => 'Exact-match filters on fields', 'additionalProperties' => true],
                        'search' => ['type' => 'string', 'description' => 'Free-text search'],
                        'limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 100, 'default' => 25],
                        'offset' => ['type' => 'integer', 'minimum' => 0, 'default' => 0],
                    ],
                    'required' => ['resource'],
                ],
                'annotations' => ['readOnlyHint' => true],
            ],
            [
                'name' => 'get_record',
                'description' => 'Get one record by id. For price_groups the price items are included.',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => ['resource' => $resource, 'id' => ['type' => 'integer']],
                    'required' => ['resource', 'id'],
                ],
                'annotations' => ['readOnlyHint' => true],
            ],
            [
                'name' => 'create_record',
                'description' => 'Create a record (only resources that allow create). Only writable fields are accepted.',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => ['resource' => $resource, 'data' => ['type' => 'object', 'additionalProperties' => true]],
                    'required' => ['resource', 'data'],
                ],
                'annotations' => ['readOnlyHint' => false, 'destructiveHint' => false],
            ],
            [
                'name' => 'update_record',
                'description' => 'Update fields of a record. Only writable fields are accepted; returns the record before and after.',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'resource' => $resource,
                        'id' => ['type' => 'integer'],
                        'data' => ['type' => 'object', 'additionalProperties' => true],
                    ],
                    'required' => ['resource', 'id', 'data'],
                ],
                'annotations' => ['readOnlyHint' => false, 'destructiveHint' => true, 'idempotentHint' => true],
            ],
            [
                'name' => 'delete_record',
                'description' => 'Permanently delete a record (only resources that allow delete). Prefer setting a status instead.',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => ['resource' => $resource, 'id' => ['type' => 'integer']],
                    'required' => ['resource', 'id'],
                ],
                'annotations' => ['readOnlyHint' => false, 'destructiveHint' => true],
            ],
            [
                'name' => 'send_notification',
                'description' => 'Send an in-app notification to a user (shown in the website and app). Give the text in German, Arabic and English; missing languages fall back to the German text.',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'user_email' => ['type' => 'string'],
                        'title_de' => ['type' => 'string'], 'title_ar' => ['type' => 'string'], 'title_en' => ['type' => 'string'],
                        'message_de' => ['type' => 'string'], 'message_ar' => ['type' => 'string'], 'message_en' => ['type' => 'string'],
                        'link' => ['type' => 'string', 'description' => 'Page to open, e.g. MyBookings'],
                        'booking_id' => ['type' => 'string'],
                    ],
                    'required' => ['user_email', 'title_de', 'message_de'],
                ],
                'annotations' => ['readOnlyHint' => false, 'destructiveHint' => false],
            ],
        ];
    }

    private function callTool(string $name, array $args): array
    {
        try {
            $data = match ($name) {
                'describe_resources' => $this->describeResources(),
                'overview' => $this->overview(),
                'list_records' => $this->listRecords($args),
                'get_record' => $this->getRecord($args),
                'create_record' => $this->createRecord($args),
                'update_record' => $this->updateRecord($args),
                'delete_record' => $this->deleteRecord($args),
                'send_notification' => $this->sendNotification($args),
                default => throw new \InvalidArgumentException("Unknown tool: {$name}"),
            };
        } catch (\InvalidArgumentException $e) {
            return ['content' => [['type' => 'text', 'text' => 'Error: '.$e->getMessage()]], 'isError' => true];
        }

        return ['content' => [['type' => 'text', 'text' => json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)]]];
    }

    // ---------------------------------------------------------------- tools

    private function describeResources(): array
    {
        $out = [];
        foreach (self::RESOURCES as $key => $cfg) {
            $model = new $cfg['model'];
            $out[$key] = [
                'about' => $cfg['about'],
                'fields' => array_values(array_diff($model->getFillable(), $model->getHidden())),
                'writable' => $this->writableFields($key),
                'create' => $cfg['create'],
                'delete' => $cfg['delete'],
                'statuses' => defined($cfg['model'].'::STATUSES') ? constant($cfg['model'].'::STATUSES') : null,
                'payment_statuses' => defined($cfg['model'].'::PAYMENT_STATUSES') ? constant($cfg['model'].'::PAYMENT_STATUSES') : null,
            ];
        }

        return $out;
    }

    private function overview(): array
    {
        return [
            'bookings_pending' => Booking::where('status', 'pending')->count(),
            'bookings_confirmed' => Booking::where('status', 'confirmed')->count(),
            'bookings_unpaid' => Booking::where('payment_status', 'unpaid')->whereNotIn('status', ['cancelled'])->count(),
            'dokumentabo_active' => Booking::where('category', 'dokumentabo')->whereNotIn('status', ['cancelled', 'completed'])->count(),
            'cancellations_new' => ContractCancellation::where('status', 'received')->count(),
            'support_requests_open' => CustomerSupportRequest::whereNotIn('status', ['closed', 'resolved', 'done'])->count(),
            'customer_requests_new' => CustomerRequest::where('status', 'new')->count(),
            'reviews_pending' => Review::where('status', 'pending')->count(),
            'provider_applications_pending' => ServiceProvider::where('status', 'pending')->count(),
            'users_total' => User::count(),
            'latest_bookings' => Booking::latest('id')->limit(5)->get(['id', 'booking_number', 'customer_name', 'service_name', 'category', 'date', 'status', 'payment_status', 'price']),
        ];
    }

    private function listRecords(array $args): array
    {
        [$key, $cfg] = $this->resource($args);
        $model = new $cfg['model'];
        $query = $cfg['model']::query();

        $allowedFilters = array_merge(['id'], $model->getFillable());
        foreach ((array) ($args['filters'] ?? []) as $field => $value) {
            if (! in_array($field, $allowedFilters, true)) {
                throw new \InvalidArgumentException("Cannot filter {$key} by '{$field}'.");
            }
            $query->where($field, $value);
        }

        if (($search = trim((string) ($args['search'] ?? ''))) !== '' && $cfg['search'] !== []) {
            $query->where(function ($q) use ($cfg, $search) {
                foreach ($cfg['search'] as $col) {
                    $q->orWhere($col, 'like', '%'.$search.'%');
                }
            });
        }

        $total = (clone $query)->count();
        $limit = max(1, min(100, (int) ($args['limit'] ?? 25)));
        $offset = max(0, (int) ($args['offset'] ?? 0));
        $records = $query->orderByDesc('id')->skip($offset)->take($limit)->get();

        return ['resource' => $key, 'total' => $total, 'offset' => $offset, 'records' => $records->toArray()];
    }

    private function getRecord(array $args): array
    {
        [$key, , $record] = $this->record($args);
        if ($key === 'price_groups') {
            $record->load('items');
        }

        return $record->toArray();
    }

    private function createRecord(array $args): array
    {
        [$key, $cfg] = $this->resource($args);
        if (! $cfg['create']) {
            throw new \InvalidArgumentException("Creating {$key} is not allowed.");
        }
        $data = $this->cleanData($key, $cfg, (array) ($args['data'] ?? []));
        if ($key === 'bookings') {
            $data['booking_number'] ??= 'ES-'.now()->format('YmdHis').'-'.random_int(100, 999);
        }
        $record = $cfg['model']::create($data);
        $this->audit('create', $key, $record->getKey(), $data);

        return ['created' => $record->fresh()->toArray()];
    }

    private function updateRecord(array $args): array
    {
        [$key, $cfg, $record] = $this->record($args);
        $data = $this->cleanData($key, $cfg, (array) ($args['data'] ?? []));
        if ($data === []) {
            throw new \InvalidArgumentException('No writable fields given. Writable: '.implode(', ', $this->writableFields($key)));
        }
        $before = $record->only(array_keys($data));
        $record->update($data);
        $this->audit('update', $key, $record->getKey(), $data);

        return ['before' => $before, 'after' => $record->fresh()->only(array_keys($data)), 'record' => $record->fresh()->toArray()];
    }

    private function deleteRecord(array $args): array
    {
        [$key, $cfg, $record] = $this->record($args);
        if (! $cfg['delete']) {
            throw new \InvalidArgumentException("Deleting {$key} is not allowed. Set a status instead.");
        }
        $snapshot = $record->toArray();
        $record->delete();
        $this->audit('delete', $key, $snapshot['id'] ?? null, []);

        return ['deleted' => $snapshot];
    }

    private function sendNotification(array $args): array
    {
        $email = trim((string) ($args['user_email'] ?? ''));
        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('user_email must be a valid email address.');
        }
        $titleDe = (string) ($args['title_de'] ?? '');
        $messageDe = (string) ($args['message_de'] ?? '');

        $notification = Notification::create([
            'user_email' => $email,
            'type' => 'admin_message',
            'title_de' => $titleDe,
            'title_ar' => $args['title_ar'] ?? $titleDe,
            'title_en' => $args['title_en'] ?? $titleDe,
            'message_de' => $messageDe,
            'message_ar' => $args['message_ar'] ?? $messageDe,
            'message_en' => $args['message_en'] ?? $messageDe,
            'link' => $args['link'] ?? null,
            'booking_id' => $args['booking_id'] ?? null,
        ]);
        $this->audit('notify', 'notifications', $notification->id, ['user_email' => $email]);

        return ['sent' => $notification->toArray()];
    }

    // -------------------------------------------------------------- helpers

    private function resource(array $args): array
    {
        $key = (string) ($args['resource'] ?? '');
        if (! isset(self::RESOURCES[$key])) {
            throw new \InvalidArgumentException("Unknown resource '{$key}'. Use one of: ".implode(', ', array_keys(self::RESOURCES)));
        }

        return [$key, self::RESOURCES[$key]];
    }

    private function record(array $args): array
    {
        [$key, $cfg] = $this->resource($args);
        $record = $cfg['model']::find((int) ($args['id'] ?? 0));
        if (! $record instanceof Model) {
            throw new \InvalidArgumentException("No {$key} record with id ".($args['id'] ?? '?').'.');
        }

        return [$key, $cfg, $record];
    }

    private function writableFields(string $key): array
    {
        $cfg = self::RESOURCES[$key];
        $fillable = (new $cfg['model'])->getFillable();

        return $cfg['writable'] === '*' ? $fillable : array_values(array_intersect($cfg['writable'], $fillable));
    }

    private function cleanData(string $key, array $cfg, array $data): array
    {
        $writable = $this->writableFields($key);
        $unknown = array_diff(array_keys($data), $writable);
        if ($unknown !== []) {
            throw new \InvalidArgumentException('Not writable for '.$key.': '.implode(', ', $unknown).'. Writable: '.implode(', ', $writable));
        }

        foreach (['status' => 'STATUSES', 'payment_status' => 'PAYMENT_STATUSES'] as $field => $const) {
            if (isset($data[$field]) && defined($cfg['model'].'::'.$const)) {
                $allowed = constant($cfg['model'].'::'.$const);
                if (! in_array($data[$field], $allowed, true)) {
                    throw new \InvalidArgumentException("{$field} must be one of: ".implode(', ', $allowed));
                }
            }
        }

        return $data;
    }

    private function audit(string $action, string $resource, mixed $id, array $data): void
    {
        Log::info('MCP '.$action, ['resource' => $resource, 'id' => $id, 'fields' => array_keys($data)]);
    }

    private function error(mixed $id, int $code, string $message): array
    {
        return ['jsonrpc' => '2.0', 'id' => $id, 'error' => ['code' => $code, 'message' => $message]];
    }
}
