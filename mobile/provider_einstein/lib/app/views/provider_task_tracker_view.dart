import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/provider_store_controller.dart';
import 'provider_workspace_widgets.dart';

class ProviderTaskTrackerView extends GetView<ProviderStoreController> {
  const ProviderTaskTrackerView({super.key});

  @override
  Widget build(BuildContext context) => _TaskTrackerBody(appBar: true);
}

class _TaskTrackerBody extends StatefulWidget {
  const _TaskTrackerBody({this.appBar = false});
  final bool appBar;
  @override
  State<_TaskTrackerBody> createState() => _TaskTrackerBodyState();
}

class _TaskTrackerBodyState extends State<_TaskTrackerBody> {
  String _filter = 'all';
  static const _filters = [
    'all',
    'pending',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
  ];
  @override
  Widget build(BuildContext context) {
    final body = GetX<ProviderStoreController>(
      builder: (controller) {
        final items = _filter == 'all'
            ? controller.bookings
            : controller.bookings
                  .where((item) => item.status == _filter)
                  .toList();
        return Column(
          children: [
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
              child: Row(
                children: _filters
                    .map(
                      (filter) => Padding(
                        padding: const EdgeInsetsDirectional.only(end: 8),
                        child: ChoiceChip(
                          label: Text(
                            filter == 'completed'
                                ? 'completed_status'.tr
                                : filter.tr,
                          ),
                          selected: _filter == filter,
                          onSelected: (_) => setState(() => _filter = filter),
                        ),
                      ),
                    )
                    .toList(),
              ),
            ),
            Expanded(
              child: items.isEmpty
                  ? Center(
                      child: Text(
                        'no_tasks'.tr,
                        style: const TextStyle(color: Color(0xFF667085)),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: items.length,
                      itemBuilder: (_, index) => BookingCard(
                        booking: items[index],
                        showComplete:
                            items[index].status == 'confirmed' ||
                            items[index].status == 'in_progress',
                      ),
                    ),
            ),
          ],
        );
      },
    );
    return widget.appBar
        ? Scaffold(
            appBar: AppBar(title: Text('task_tracker'.tr)),
            body: body,
          )
        : body;
  }
}
