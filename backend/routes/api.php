<?php

use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminClientWorkspaceController;
use App\Http\Controllers\Api\AdminServiceController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\BookingReportController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\ContractCancellationController;
use App\Http\Controllers\Api\McpController;
use App\Http\Controllers\Api\StripeController;
use App\Http\Controllers\Api\CustomerClientController;
use App\Http\Controllers\Api\CustomerDocumentController;
use App\Http\Controllers\Api\CustomerFileController;
use App\Http\Controllers\Api\CustomerSubscriptionController;
use App\Http\Controllers\Api\CustomerFormController;
use App\Http\Controllers\Api\CustomerReminderController;
use App\Http\Controllers\Api\CustomerPortalController;
use App\Http\Controllers\Api\CustomerRequestController;
use App\Http\Controllers\Api\CustomerSupportController;
use App\Http\Controllers\Api\FileUploadController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\NotificationPreferenceController;
use App\Http\Controllers\Api\OfferController;
use App\Http\Controllers\Api\PaymentAdminController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PriceAdminController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ProviderDashboardController;
use App\Http\Controllers\Api\ProviderDocumentController;
use App\Http\Controllers\Api\ProviderEarningsController;
use App\Http\Controllers\Api\ProviderNotificationController;
use App\Http\Controllers\Api\PublicContentController;
use App\Http\Controllers\Api\RevenueReportController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SeoSettingController;
use App\Http\Controllers\Api\ServiceExtensionController;
use App\Http\Controllers\Api\ServiceProviderController;
use App\Http\Controllers\Api\UserNotificationController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok']));

// MCP admin endpoint for Claude (secret URL, see config/services.php)
Route::match(['get', 'post', 'delete'], 'mcp/{secret}', [McpController::class, 'handle'])->middleware('throttle:120,1');

Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/provider/login', [AuthController::class, 'providerLogin']);
Route::post('auth/provider/register', [AuthController::class, 'providerRegister']);
Route::post('auth/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('auth/verify-email', [AuthController::class, 'verifyEmail'])->middleware('throttle:10,1');
Route::post('auth/verify-email/resend', [AuthController::class, 'resendVerification'])->middleware('throttle:5,1');
Route::get('auth/me', [AuthController::class, 'me']);
Route::post('auth/logout', [AuthController::class, 'logout']);
Route::delete('auth/account', [AuthController::class, 'deleteAccount'])->middleware(['api.auth:user', 'throttle:10,1']);
Route::post('chat/respond', [ChatController::class, 'respond']);
Route::get('customer-support', [CustomerSupportController::class, 'index']);
Route::post('customer-support/requests', [CustomerSupportController::class, 'store']);
Route::get('public/services', [PublicContentController::class, 'services']);
Route::get('public/pricing', [PublicContentController::class, 'pricing']);
Route::get('public/home', [PublicContentController::class, 'home']);
Route::get('public/offers', [OfferController::class, 'index']);
Route::get('public/ratings', [PublicContentController::class, 'ratings']);
Route::get('public/reviews', [ReviewController::class, 'index']);
Route::post('public/reviews', [ReviewController::class, 'store']);
Route::post('stripe/webhook', [StripeController::class, 'webhook']);
Route::post('public/cancellations', [ContractCancellationController::class, 'store'])->middleware('throttle:10,1');
Route::get('seo-settings/page/{pageName}', [SeoSettingController::class, 'byPage']);

Route::middleware('api.auth:admin,provider,user')->group(function () {
    Route::post('uploads', [FileUploadController::class, 'store']);
    Route::get('profile', [ProfileController::class, 'show'])->middleware('own.email');
    Route::patch('profile', [ProfileController::class, 'update'])->middleware('own.email');
    Route::get('customer/dashboard', [CustomerPortalController::class, 'dashboard'])->middleware('own.email');
    Route::middleware('api.auth:user')->group(function () {
        Route::get('customer/clients', [CustomerClientController::class, 'index']);
        Route::post('customer/clients', [CustomerClientController::class, 'store']);
        Route::get('customer/clients/{managedClient}', [CustomerClientController::class, 'show']);
        Route::patch('customer/clients/{managedClient}', [CustomerClientController::class, 'update']);
        Route::post('customer/clients/{managedClient}/communications', [CustomerClientController::class, 'storeCommunication']);
        Route::post('customer/clients/{managedClient}/requests', [CustomerClientController::class, 'storeRequest']);
        Route::patch('customer/clients/{managedClient}/requests/{clientRequest}', [CustomerClientController::class, 'updateRequest']);
        Route::post('customer/clients/{managedClient}/files', [CustomerClientController::class, 'storeFile']);
        Route::post('customer/clients/{managedClient}/invoices', [CustomerClientController::class, 'storeInvoice']);
    });
    Route::get('customer/documents', [CustomerDocumentController::class, 'index']);
    Route::post('customer/documents', [CustomerDocumentController::class, 'store'])->middleware('throttle:60,1');
    Route::get('customer/documents/{document}/download', [CustomerDocumentController::class, 'download']);
    Route::delete('customer/documents/{document}', [CustomerDocumentController::class, 'destroy']);
    Route::post('customer/documents/{document}/translate', [CustomerDocumentController::class, 'translate'])->middleware('throttle:20,1');
    Route::get('customer/files', [CustomerFileController::class, 'index']);
    Route::post('customer/files', [CustomerFileController::class, 'store']);
    Route::get('customer/files/{customerFile}', [CustomerFileController::class, 'show']);
    Route::delete('customer/files/{customerFile}', [CustomerFileController::class, 'destroy']);
    Route::post('customer/files/{customerFile}/documents', [CustomerDocumentController::class, 'storeInFile'])->middleware('throttle:60,1');
    Route::get('customer/subscription', [CustomerSubscriptionController::class, 'show']);
    Route::post('customer/subscription/checkout', [CustomerSubscriptionController::class, 'checkout'])->middleware('throttle:10,1');
    Route::post('customer/subscription/cancel', [CustomerSubscriptionController::class, 'cancel']);
    Route::get('customer/reminders', [CustomerReminderController::class, 'index']);
    Route::post('customer/reminders', [CustomerReminderController::class, 'store']);
    Route::patch('customer/reminders/{reminder}', [CustomerReminderController::class, 'update']);
    Route::get('customer/forms', [CustomerFormController::class, 'index']);
    Route::put('customer/form-data', [CustomerFormController::class, 'saveData']);
    Route::get('customer/bookings', [CustomerPortalController::class, 'bookings'])->middleware('own.email');
    Route::get('customer/notifications', [NotificationController::class, 'index'])->middleware('own.email');
    Route::post('customer/notifications', [NotificationController::class, 'store'])->middleware('own.email');
    Route::patch('customer/notifications/{notification}/read', [NotificationController::class, 'markRead'])->middleware('own.email');
    Route::patch('customer/notifications/mark-all-read', [NotificationController::class, 'markAllRead'])->middleware('own.email');
    Route::delete('customer/notifications/read', [NotificationController::class, 'deleteRead'])->middleware('own.email');
    Route::get('customer/notification-preferences', [NotificationPreferenceController::class, 'show'])->middleware('own.email');
    Route::put('customer/notification-preferences', [NotificationPreferenceController::class, 'update'])->middleware('own.email');
    Route::get('payments/bookings/{booking}', [PaymentController::class, 'show']);
    Route::post('payments/bookings/{booking}/checkout', [StripeController::class, 'checkout']);
    Route::apiResource('bookings', BookingController::class);
    Route::get('service-extensions', [ServiceExtensionController::class, 'index']);
    Route::post('service-extensions', [ServiceExtensionController::class, 'store']);
    Route::patch('service-extensions/{serviceExtension}', [ServiceExtensionController::class, 'update']);
    Route::post('service-extensions/{serviceExtension}/authorize-payment', [ServiceExtensionController::class, 'authorizePayment']);
});

Route::middleware('api.auth:admin,provider')->group(function () {
    // Only staff may mark bookings as paid (customers pay through the payment provider)
    Route::patch('payments/bookings/{booking}/status', [PaymentController::class, 'updateStatus']);
    Route::get('provider/dashboard', [ProviderDashboardController::class, 'show']);
    Route::patch('provider/bookings/{booking}/action', [ProviderDashboardController::class, 'action']);
    Route::patch('provider/bookings/{booking}/documents', [ProviderDashboardController::class, 'updateDocuments']);
    Route::patch('provider/profile/{serviceProvider}', [ProviderDashboardController::class, 'updateProfile']);
    Route::apiResource('provider-documents', ProviderDocumentController::class)->only(['index', 'store', 'destroy']);
    // Customer files: admins and providers
    Route::get('admin/customer-documents', [CustomerDocumentController::class, 'adminIndex']);
    Route::post('admin/customer-documents', [CustomerDocumentController::class, 'adminStore']);
});

Route::middleware('api.auth:provider')->group(function () {
    Route::get('provider/earnings', [ProviderEarningsController::class, 'index']);
    Route::get('provider/notifications', [ProviderNotificationController::class, 'index']);
    Route::patch('provider/notifications/read-all', [ProviderNotificationController::class, 'markAllRead']);
    Route::patch('provider/notifications/{notification}/read', [ProviderNotificationController::class, 'markRead']);
});

Route::middleware('api.auth:admin')->group(function () {
    Route::get('admin/dashboard', [AdminDashboardController::class, 'index']);
    Route::get('admin/cancellations', [ContractCancellationController::class, 'index']);
    Route::patch('admin/cancellations/{cancellation}', [ContractCancellationController::class, 'update']);
    Route::get('admin/client-workspaces', [AdminClientWorkspaceController::class, 'index']);
    Route::get('admin/client-workspaces/{managedClient}', [AdminClientWorkspaceController::class, 'show']);
    Route::patch('admin/client-workspaces/{managedClient}/requests/{clientRequest}', [AdminClientWorkspaceController::class, 'updateRequest']);
    Route::get('reports/bookings', [BookingReportController::class, 'index']);
    Route::patch('reports/bookings/{booking}/confirm', [BookingReportController::class, 'confirm']);
    Route::get('admin/users', [AdminUserController::class, 'index']);
    Route::patch('admin/users/{user}', [AdminUserController::class, 'update']);
    Route::delete('admin/users/{user}', [AdminUserController::class, 'destroy']);
    Route::get('admin/user-notifications', [UserNotificationController::class, 'index']);
    Route::post('admin/user-notifications/mark-all-seen', [UserNotificationController::class, 'markAllSeen']);
    Route::apiResource('admin/services', AdminServiceController::class);
    Route::apiResource('admin/price-groups', PriceAdminController::class);
    Route::get('admin/payments', [PaymentAdminController::class, 'index']);
    Route::patch('admin/payments/{booking}/status', [PaymentAdminController::class, 'updateStatus']);
    Route::patch('admin/payments/{booking}/refund', [PaymentAdminController::class, 'refund']);
    Route::delete('admin/payments/{booking}/delete-unpaid', [PaymentAdminController::class, 'deleteUnpaid']);
    Route::get('admin/revenue-reports', [RevenueReportController::class, 'index']);
    Route::get('admin/provider-applications', [ServiceProviderController::class, 'index']);
    Route::patch('admin/provider-applications/{serviceProvider}/approve', [ServiceProviderController::class, 'approve']);
    Route::patch('admin/provider-applications/{serviceProvider}/reject', [ServiceProviderController::class, 'reject']);
    Route::post('admin/provider-applications/{serviceProvider}/welcome-email-request', [ServiceProviderController::class, 'requestWelcomeEmail']);
    Route::apiResource('admin/providers', ServiceProviderController::class)->parameters(['providers' => 'serviceProvider']);
    Route::apiResource('admin/seo-settings', SeoSettingController::class)->parameters(['seo-settings' => 'seoSetting']);
    Route::patch('customer-requests/{customerRequest}/accept', [CustomerRequestController::class, 'accept']);
    Route::patch('customer-requests/{customerRequest}/reject', [CustomerRequestController::class, 'reject']);
    Route::apiResource('customer-requests', CustomerRequestController::class);
});
