import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/provider_auth_controller.dart';
import '../controllers/provider_store_controller.dart';
import '../models/provider_booking.dart';
import '../routes/app_routes.dart';
import '../theme/app_theme.dart';
import 'provider_workspace_widgets.dart';

class ProviderWorkspaceView extends StatefulWidget {
  const ProviderWorkspaceView({super.key});

  @override
  State<ProviderWorkspaceView> createState() => _ProviderWorkspaceViewState();
}

class _ProviderWorkspaceViewState extends State<ProviderWorkspaceView> {
  var _index = 0;
  final _pages = const [
    _DashboardTab(),
    _NewRequestsTab(),
    _MyWorkTab(),
    _BookingsTab(),
    _MoreTab(),
  ];

  @override
  Widget build(BuildContext context) => Scaffold(
    body: IndexedStack(index: _index, children: _pages),
    bottomNavigationBar: NavigationBar(
      selectedIndex: _index,
      onDestinationSelected: (value) => setState(() => _index = value),
      destinations: [
        NavigationDestination(
          icon: const Icon(Icons.grid_view_rounded),
          label: 'dashboard'.tr,
        ),
        NavigationDestination(
          icon: const Icon(Icons.inbox_outlined),
          label: 'new_requests'.tr,
        ),
        NavigationDestination(
          icon: const Icon(Icons.work_outline_rounded),
          label: 'my_work'.tr,
        ),
        NavigationDestination(
          icon: const Icon(Icons.calendar_month_outlined),
          label: 'bookings'.tr,
        ),
        NavigationDestination(
          icon: const Icon(Icons.more_horiz_rounded),
          label: 'more'.tr,
        ),
      ],
    ),
  );
}

class _Page extends GetView<ProviderStoreController> {
  const _Page({required this.title, required this.child, this.actions});
  final String title;
  final Widget child;
  final List<Widget>? actions;
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Text(title),
      actions: [
        const ProviderLanguageMenu(),
        ...(actions ??
            [
              IconButton(
                tooltip: 'refresh'.tr,
                onPressed: controller.refreshWorkspace,
                icon: const Icon(Icons.refresh_rounded),
              ),
            ]),
      ],
    ),
    body: child,
  );
}

class _DashboardTab extends GetView<ProviderStoreController> {
  const _DashboardTab();
  @override
  Widget build(BuildContext context) => _Page(
    title: 'dashboard'.tr,
    actions: [
      IconButton(
        tooltip: 'refresh'.tr,
        onPressed: controller.refreshWorkspace,
        icon: const Icon(Icons.refresh_rounded),
      ),
      IconButton(
        tooltip: 'logout'.tr,
        onPressed: Get.find<ProviderAuthController>().logout,
        icon: const Icon(Icons.logout_rounded),
      ),
    ],
    child: Obx(() {
      if (controller.isLoading.value && controller.profile.value == null) {
        return const Center(child: CircularProgressIndicator());
      }
      final profile = controller.profile.value;
      final summary = controller.summary.value;
      final newRequests = controller.bookings
          .where((item) => item.status == 'pending')
          .length;
      final unreadNotifications = controller.unreadNotifications;
      return RefreshIndicator(
        onRefresh: controller.refreshWorkspace,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(
              '${'app_name'.tr} ${profile?.fullName ?? ''}',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w800,
                color: AppTheme.navy,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              profile?.email ?? '',
              style: const TextStyle(color: Color(0xFF667085)),
            ),
            if (controller.errorText.value.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 10),
                child: Text(
                  controller.errorText.value,
                  style: const TextStyle(color: Colors.redAccent),
                ),
              ),
            const SizedBox(height: 18),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              childAspectRatio: 1.55,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              children: [
                _Metric(
                  icon: Icons.event_available_outlined,
                  label: 'upcoming'.tr,
                  value: '${summary.upcoming}',
                ),
                _Metric(
                  icon: Icons.task_alt_rounded,
                  label: 'completed'.tr,
                  value: '${summary.completed}',
                ),
                _Metric(
                  icon: Icons.account_balance_wallet_outlined,
                  label: 'earnings'.tr,
                  value: '${summary.totalEarnings.toStringAsFixed(0)} EUR',
                ),
                _Metric(
                  icon: Icons.star_outline_rounded,
                  label: 'rating'.tr,
                  value: profile?.rating?.toStringAsFixed(1) ?? '-',
                ),
              ],
            ),
            const SizedBox(height: 22),
            Row(
              children: [
                Text(
                  'notifications'.tr,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const Spacer(),
                IconButton(
                  tooltip: 'notifications'.tr,
                  onPressed: () => Get.toNamed(AppRoutes.notifications),
                  icon: Badge(
                    isLabelVisible: unreadNotifications > 0,
                    label: Text('$unreadNotifications'),
                    child: const Icon(
                      Icons.notifications_none_rounded,
                      color: AppTheme.gold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            _QuickOpen(
              icon: Icons.inbox_outlined,
              title: 'available_requests'.tr,
              subtitle: '$newRequests',
              onTap: () => Get.to(() => const _NewRequestsTab()),
            ),
            const SizedBox(height: 22),
            Text(
              'my_work'.tr,
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 10),
            ...controller.bookings
                .where(
                  (item) =>
                      item.status == 'confirmed' ||
                      item.status == 'in_progress',
                )
                .take(3)
                .map((item) => BookingCard(booking: item, showComplete: true)),
            if (controller.bookings
                .where(
                  (item) =>
                      item.status == 'confirmed' ||
                      item.status == 'in_progress',
                )
                .isEmpty)
              const _EmptyState(),
          ],
        ),
      );
    }),
  );
}

class _Metric extends StatelessWidget {
  const _Metric({required this.icon, required this.label, required this.value});
  final IconData icon;
  final String label;
  final String value;
  @override
  Widget build(BuildContext context) => Card(
    child: Padding(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: AppTheme.gold, size: 20),
          const SizedBox(height: 5),
          Text(
            value,
            style: const TextStyle(
              fontWeight: FontWeight.w800,
              color: AppTheme.navy,
              fontSize: 17,
            ),
          ),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 12, color: Color(0xFF667085)),
          ),
        ],
      ),
    ),
  );
}

class _QuickOpen extends StatelessWidget {
  const _QuickOpen({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => Card(
    child: ListTile(
      leading: Icon(icon, color: AppTheme.navy),
      title: Text(title),
      trailing: Text(
        subtitle,
        style: const TextStyle(fontWeight: FontWeight.w800),
      ),
      onTap: onTap,
    ),
  );
}

class _NewRequestsTab extends GetView<ProviderStoreController> {
  const _NewRequestsTab();
  @override
  Widget build(BuildContext context) => _Page(
    title: 'new_requests'.tr,
    child: Obx(() {
      final requests = controller.bookings
          .where((item) => item.status == 'pending')
          .toList();
      return _BookingList(
        bookings: requests,
        empty: 'no_available_requests'.tr,
        itemBuilder: (item) => BookingCard(booking: item, showActions: true),
      );
    }),
  );
}

class _MyWorkTab extends GetView<ProviderStoreController> {
  const _MyWorkTab();
  @override
  Widget build(BuildContext context) => _Page(
    title: 'my_work'.tr,
    child: Obx(() {
      final items = controller.bookings
          .where(
            (item) =>
                item.status == 'confirmed' || item.status == 'in_progress',
          )
          .toList();
      return _BookingList(
        bookings: items,
        empty: 'no_bookings'.tr,
        itemBuilder: (item) =>
            BookingCard(booking: item, showComplete: true, showDocuments: true),
      );
    }),
  );
}

class _BookingsTab extends GetView<ProviderStoreController> {
  const _BookingsTab();
  @override
  Widget build(BuildContext context) => _Page(
    title: 'bookings'.tr,
    child: Obx(
      () => _BookingList(
        bookings: controller.bookings.toList(),
        empty: 'no_bookings'.tr,
        itemBuilder: (item) => BookingCard(
          booking: item,
          showDocuments: item.status != 'cancelled',
        ),
      ),
    ),
  );
}

class _BookingList extends StatelessWidget {
  const _BookingList({
    required this.bookings,
    required this.empty,
    required this.itemBuilder,
  });
  final List<ProviderBooking> bookings;
  final String empty;
  final Widget Function(ProviderBooking item) itemBuilder;
  @override
  Widget build(BuildContext context) => RefreshIndicator(
    onRefresh: Get.find<ProviderStoreController>().refreshWorkspace,
    child: bookings.isEmpty
        ? ListView(children: [_EmptyState(text: empty)])
        : ListView(
            padding: const EdgeInsets.all(16),
            children: bookings.map(itemBuilder).toList(),
          ),
  );
}

class _MoreTab extends StatelessWidget {
  const _MoreTab();
  @override
  Widget build(BuildContext context) => _Page(
    title: 'more'.tr,
    child: ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _MoreTile(
          icon: Icons.person_outline_rounded,
          title: 'profile'.tr,
          route: AppRoutes.profile,
        ),
        _MoreTile(
          icon: Icons.notifications_none_rounded,
          title: 'notifications'.tr,
          route: AppRoutes.notifications,
        ),
        _MoreTile(
          icon: Icons.account_balance_wallet_outlined,
          title: 'earnings_report'.tr,
          route: AppRoutes.earnings,
        ),
        _MoreTile(
          icon: Icons.folder_outlined,
          title: 'documents'.tr,
          route: AppRoutes.documents,
        ),
        _MoreTile(
          icon: Icons.checklist_rounded,
          title: 'task_tracker'.tr,
          route: AppRoutes.taskTracker,
        ),
        _MoreTile(
          icon: Icons.update_rounded,
          title: 'extensions'.tr,
          route: AppRoutes.extensions,
        ),
      ],
    ),
  );
}

class _MoreTile extends StatelessWidget {
  const _MoreTile({
    required this.icon,
    required this.title,
    required this.route,
  });
  final IconData icon;
  final String title;
  final String route;
  @override
  Widget build(BuildContext context) => Card(
    child: ListTile(
      leading: Icon(icon, color: AppTheme.navy),
      title: Text(title),
      trailing: const Icon(Icons.chevron_right_rounded),
      onTap: () => Get.toNamed(route),
    ),
  );
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({this.text});
  final String? text;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.all(32),
    child: Center(
      child: Text(
        text ?? 'no_bookings'.tr,
        textAlign: TextAlign.center,
        style: const TextStyle(color: Color(0xFF667085)),
      ),
    ),
  );
}
