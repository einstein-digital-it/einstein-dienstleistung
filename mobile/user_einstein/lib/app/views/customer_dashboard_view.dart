import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/customer_dashboard_controller.dart';
import '../controllers/documents_controller.dart';
import '../models/booking_item.dart';
import '../routes/app_routes.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/ui.dart';
import 'documents_view.dart';

/// Home for logged-in customers: upload a letter, reminders, shortcuts,
/// latest documents and upcoming bookings.
class CustomerDashboardView extends GetView<CustomerDashboardController> {
  const CustomerDashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    final docs = Get.find<DocumentsController>();
    if (!docs.loadedOnce.value && !docs.isLoading.value) {
      WidgetsBinding.instance.addPostFrameCallback((_) => docs.load());
    }
    return Scaffold(
      bottomNavigationBar: const AppBottomNav(tab: NavTab.home),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            await Future.wait([controller.refreshDashboard(), docs.load()]);
          },
          child: Obx(() {
            controller.store.locale.value;
            final store = controller.store;
            final upcoming = store.upcomingBookings;
            return ListView(
              padding: const EdgeInsets.fromLTRB(20, 14, 20, 28),
              children: [
                _TopBar(name: store.profile.value.fullName, unread: store.unreadNotificationsCount),
                const SizedBox(height: 18),
                const UploadHeroCard(compact: true),
                if (docs.reminders.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  SectionTitle(
                    title: 'reminders_title'.tr,
                    action: docs.reminders.length > 3 ? 'see_all'.tr : null,
                    onAction: () => Get.offNamed(AppRoutes.documents),
                  ),
                  for (final r in docs.reminders.take(3)) ...[
                    ReminderCard(reminder: r),
                    const SizedBox(height: 10),
                  ],
                ],
                const SizedBox(height: 22),
                const _QuickGrid(),
                const SizedBox(height: 24),
                SectionTitle(
                  title: 'files_recent'.tr,
                  action: docs.documents.isEmpty ? null : 'see_all'.tr,
                  onAction: () => Get.offNamed(AppRoutes.documents),
                ),
                if (docs.documents.isEmpty)
                  AppCard(child: EmptyState(icon: Icons.folder_open_outlined, text: 'files_empty_dashboard'.tr))
                else
                  for (final d in docs.recent) ...[
                    DocumentTile(doc: d, showFolder: true),
                    const SizedBox(height: 10),
                  ],
                const SizedBox(height: 18),
                SectionTitle(
                  title: 'upcoming_bookings'.tr,
                  action: upcoming.isEmpty ? null : 'see_all'.tr,
                  onAction: () => Get.offNamed(AppRoutes.myBookings),
                ),
                if (upcoming.isEmpty)
                  AppCard(child: EmptyState(icon: Icons.event_available_outlined, text: 'no_bookings'.tr))
                else
                  for (final b in upcoming) ...[
                    _BookingRow(item: b),
                    const SizedBox(height: 10),
                  ],
              ],
            );
          }),
        ),
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({required this.name, required this.unread});

  final String name;
  final int unread;

  @override
  Widget build(BuildContext context) {
    final first = name.trim().isEmpty ? '' : name.trim().split(' ').first;
    final initials = name.trim().isEmpty
        ? 'ES'
        : name.trim().split(RegExp(r'\s+')).take(2).map((p) => p.isEmpty ? '' : p[0].toUpperCase()).join();
    return Row(
      children: [
        GestureDetector(
          onTap: () => Get.offNamed(AppRoutes.profile),
          child: CircleAvatar(
            radius: 24,
            backgroundColor: AppColors.navy,
            child: Text(initials, style: const TextStyle(color: AppColors.goldBright, fontWeight: FontWeight.w700)),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('welcome_back'.tr, style: Theme.of(context).textTheme.bodySmall),
              Text(first.isEmpty ? 'EinStein' : first,
                  style: Theme.of(context).textTheme.headlineSmall, maxLines: 1, overflow: TextOverflow.ellipsis),
            ],
          ),
        ),
        _RoundIconButton(
          icon: Icons.notifications_none_rounded,
          badge: unread,
          onTap: () => Get.toNamed(AppRoutes.notifications),
        ),
      ],
    );
  }
}

class _RoundIconButton extends StatelessWidget {
  const _RoundIconButton({required this.icon, required this.onTap, this.badge = 0});

  final IconData icon;
  final VoidCallback onTap;
  final int badge;

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Material(
          color: Colors.white,
          shape: const CircleBorder(side: BorderSide(color: AppColors.line)),
          child: InkWell(
            customBorder: const CircleBorder(),
            onTap: onTap,
            child: SizedBox(width: 46, height: 46, child: Icon(icon, color: AppColors.navy)),
          ),
        ),
        if (badge > 0)
          PositionedDirectional(
            top: -2,
            end: -2,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
              decoration: BoxDecoration(color: AppColors.danger, borderRadius: BorderRadius.circular(99), border: Border.all(color: Colors.white, width: 2)),
              child: Text('$badge', style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.w700)),
            ),
          ),
      ],
    );
  }
}

class _QuickGrid extends StatelessWidget {
  const _QuickGrid();

  @override
  Widget build(BuildContext context) {
    final items = [
      (Icons.add_task_rounded, 'quick_book'.tr, 'quick_book_sub'.tr, AppColors.purple, AppRoutes.bookings, false),
      (Icons.folder_rounded, 'nav_documents'.tr, 'quick_files_sub'.tr, const Color(0xFF2563EB), AppRoutes.documents, true),
      (Icons.edit_document, 'nav_forms'.tr, 'quick_forms_sub'.tr, AppColors.gold, AppRoutes.forms, true),
      (Icons.support_agent_rounded, 'quick_support'.tr, 'quick_support_sub'.tr, const Color(0xFF059669), AppRoutes.customerService, false),
    ];
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 1.55,
      children: [
        for (final item in items)
          AppCard(
            padding: const EdgeInsets.all(14),
            onTap: () => item.$6 ? Get.offNamed(item.$5) : Get.toNamed(item.$5),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                IconTile(icon: item.$1, color: item.$4, size: 36),
                const Spacer(),
                Text(item.$2, maxLines: 1, overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: AppColors.navy, fontWeight: FontWeight.w700, fontSize: 14.5)),
                Text(item.$3, maxLines: 1, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ),
      ],
    );
  }
}

class _BookingRow extends StatelessWidget {
  const _BookingRow({required this.item});

  final BookingItem item;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: const EdgeInsets.all(14),
      onTap: () => Get.offNamed(AppRoutes.myBookings),
      child: Row(
        children: [
          IconTile(icon: Icons.event_rounded, color: item.statusColor, size: 42),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.displayService, maxLines: 1, overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: AppColors.navy, fontWeight: FontWeight.w700)),
                const SizedBox(height: 3),
                Text('${item.date} · ${item.time}', style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ),
          Pill(label: item.statusKey.tr, color: item.statusColor),
        ],
      ),
    );
  }
}
