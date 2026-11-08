<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerDocument;
use App\Models\CustomerFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Files the customer creates and names. With the Unterlagen-Abo the AI sorts
 * each uploaded paper into a section, shown numbered: 01_Arbeitsvertrag, ...
 */
class CustomerFileController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $files = CustomerFile::query()
            ->whereRaw('LOWER(user_email) = ?', [strtolower($request->user()->email)])
            ->withCount('documents')->latest()->get();

        return response()->json(['data' => $files]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:120']]);
        $file = CustomerFile::create([
            'user_email' => strtolower($request->user()->email),
            'name' => trim($data['name']),
        ]);

        return response()->json(['data' => $file->loadCount('documents')], 201);
    }

    public function show(Request $request, CustomerFile $customerFile): JsonResponse
    {
        $this->authorizeOwner($request, $customerFile);
        $documents = $customerFile->documents()->orderBy('id')->get();

        return response()->json(['data' => [
            'id' => $customerFile->id,
            'name' => $customerFile->name,
            'sections' => self::numberedSections($documents->pluck('section')->all()),
            'documents' => $documents->sortByDesc('id')->values(),
        ]]);
    }

    public function destroy(Request $request, CustomerFile $customerFile): JsonResponse
    {
        $this->authorizeOwner($request, $customerFile);
        $customerFile->documents->each(function (CustomerDocument $document) {
            Storage::disk('local')->delete($document->file_path);
            $document->delete();
        });
        $customerFile->delete();

        return response()->json(null, 204);
    }

    public static function authorizeOwner(Request $request, CustomerFile $file): void
    {
        if (strcasecmp((string) $request->user()?->email, $file->user_email) !== 0) {
            abort(404);
        }
    }

    /**
     * Sections in the order they first appeared, numbered from 01 (00 is the
     * overview the app builds itself). Papers without a section are not counted.
     *
     * @return array<int, array{name: string, label: string}>
     */
    private static function numberedSections(array $sectionsInOrder): array
    {
        $names = array_values(array_unique(array_filter($sectionsInOrder)));

        return array_map(fn (string $name, int $i) => [
            'name' => $name,
            'label' => sprintf('%02d_%s', $i + 1, $name),
        ], $names, array_keys($names));
    }
}
