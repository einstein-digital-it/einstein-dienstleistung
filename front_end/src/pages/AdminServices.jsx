import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Euro,
  FileText,
  Globe,
  MoreHorizontal,
  Pencil,
  Plus,
  Printer,
  Search,
  Settings,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { adminServicesApi } from "@/api/backendClient";
import { getAdminLocale, getAdminText } from "@/lib/adminLocalization";
import { toast } from "sonner";

const initialService = {
  name_de: "",
  name_ar: "",
  name_en: "",
  category: "office",
  description_de: "",
  description_ar: "",
  description_en: "",
  price_from: "",
  price_unit: "hour",
  status: "active",
  is_active: true,
};

const categoryMeta = (t) => ({
  office: { label: t.categories.office, icon: Briefcase, color: "bg-violet-50 text-violet-700 border-violet-200" },
  forms: { label: t.categories.forms, icon: ClipboardList, color: "bg-teal-50 text-teal-700 border-teal-200" },
  admin: { label: t.categories.admin, icon: FileText, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  coordination: { label: t.categories.coordination, icon: Settings, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  mercosur: { label: t.categories.mercosur, icon: Globe, color: "bg-amber-50 text-amber-700 border-amber-200" },
  tutoring: { label: t.categories.tutoring, icon: BookOpen, color: "bg-blue-50 text-blue-700 border-blue-200" },
  print: { label: t.categories.print, icon: Printer, color: "bg-pink-50 text-pink-700 border-pink-200" }
});

export default function AdminServices() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deletingService, setDeletingService] = useState(null);
  const [serviceForm, setServiceForm] = useState(initialService);
  const [formError, setFormError] = useState("");
  const language = getAdminLocale();
  const t = getAdminText(language).services;
  const categories = categoryMeta(t);
  const queryClient = useQueryClient();
  const { data: backendServices = [] } = useQuery({
    queryKey: ["admin-services"],
    queryFn: adminServicesApi.listServices,
  });
  const services = backendServices;

  const createServiceMutation = useMutation({
    mutationFn: adminServicesApi.createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      setServiceForm(initialService);
      setFormError("");
      setIsCreateOpen(false);
      toast.success(t.createSuccess);
    },
    onError: () => toast.error(t.createError),
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, payload }) => adminServicesApi.updateService(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      setServiceForm(initialService);
      setFormError("");
      setEditingService(null);
      setIsCreateOpen(false);
      toast.success(t.updateSuccess);
    },
    onError: () => toast.error(t.updateError),
  });

  const deleteServiceMutation = useMutation({
    mutationFn: adminServicesApi.deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      setDeletingService(null);
      toast.success(t.deleteSuccess);
    },
    onError: () => toast.error(t.deleteError),
  });

  const updateForm = (field, value) => {
    setServiceForm((current) => ({ ...current, [field]: value }));
  };

  const openCreateDialog = () => {
    setServiceForm(initialService);
    setFormError("");
    setEditingService(null);
    setIsCreateOpen(true);
  };

  const openEditDialog = (service) => {
    setServiceForm({
      name_de: service.name_de || service.name || "",
      name_ar: service.name_ar || "",
      name_en: service.name_en || "",
      category: service.category || "office",
      description_de: service.description_de || service.description || "",
      description_ar: service.description_ar || "",
      description_en: service.description_en || "",
      price_from: String(service.price_from ?? ""),
      price_unit: service.price_unit || "hour",
      status: service.status || "active",
      is_active: service.status === "active",
    });
    setFormError("");
    setEditingService(service);
    setIsCreateOpen(true);
  };

  const submitService = (event) => {
    event.preventDefault();
    const price = Number(serviceForm.price_from);

    if (!serviceForm.name_de.trim() || !serviceForm.category || Number.isNaN(price) || price < 0) {
      setFormError(t.requiredFields);
      return;
    }

    setFormError("");
    const payload = {
      name_de: serviceForm.name_de.trim(),
      name_ar: serviceForm.name_ar.trim() || null,
      name_en: serviceForm.name_en.trim() || null,
      category: serviceForm.category,
      description_de: serviceForm.description_de.trim() || null,
      description_ar: serviceForm.description_ar.trim() || null,
      description_en: serviceForm.description_en.trim() || null,
      price_from: price,
      price_unit: serviceForm.price_unit,
      status: serviceForm.status,
    };

    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, payload });
      return;
    }

    createServiceMutation.mutate(payload);
  };

  const filteredServices = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return services;
    return services.filter((service) =>
      [
        service.name,
        service.name_de,
        service.name_ar,
        service.name_en,
        service.category,
        service.description,
        service.description_de,
        service.description_ar,
        service.description_en,
      ].join(" ").toLowerCase().includes(term)
    );
  }, [search, services]);

  const activeCount = services.filter((service) => service.status === "active").length;
  const totalBookings = services.reduce((sum, service) => sum + Number(service.bookings || 0), 0);
  const startingPrice = services.length
    ? Math.min(...services.map((service) => Number(service.price_from) || 0))
    : 0;
  const isSaving = createServiceMutation.isPending || updateServiceMutation.isPending;

  return (
    <div className="min-h-screen bg-[#f6f8fb] py-8">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <p className="mb-2 text-sm font-semibold text-[#c9a227]">{t.breadcrumb}</p>
            <h1 className="text-3xl font-bold text-[#1e3a5f]">{t.title}</h1>
            <p className="mt-2 text-sm text-[#65758b]">
              {t.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="border-[#dbe3ee]">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {t.filter}
            </Button>
            <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8a]" onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              {t.add}
            </Button>
          </div>
        </motion.div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { label: t.active, value: activeCount, icon: CheckCircle2 },
            { label: t.bookings, value: totalBookings, icon: ClipboardList },
            { label: t.startingPrice, value: `${t.fromPrice} ${startingPrice} EUR`, icon: Euro }
          ].map((stat) => (
            <Card key={stat.label} className="border-[#e3e9f2] shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-md bg-[#eef3f9] p-3 text-[#1e3a5f]">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-[#65758b]">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#1e3a5f]">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-6 border-[#e3e9f2] shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8ea0b7]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.search}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map((service, index) => {
            const meta = categories[service.category] || categories.admin;
            const Icon = meta.icon;
            const serviceName = service[`name_${language}`] || service.name;
            const serviceDescription = service[`description_${language}`] || service.description;
            const statusLabel = service.status === "active"
              ? t.activeStatus
              : service.status === "inactive"
                ? t.inactive
                : t.draft;
            const priceUnit = t.priceUnits[service.price_unit] || service.price_unit;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card className="h-full border-[#e3e9f2] shadow-sm transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-[#1e3a5f] p-3 text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-[#1e3a5f]">{serviceName}</CardTitle>
                          <Badge variant="outline" className={`mt-2 ${meta.color}`}>
                            {meta.label}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={t.editService}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(service)}>
                            <Pencil className="me-2 h-4 w-4" />
                            {t.editService}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setDeletingService(service)}>
                            <Trash2 className="me-2 h-4 w-4" />
                            {t.deleteService}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="min-h-[64px] text-sm leading-6 text-[#65758b]">{serviceDescription}</p>
                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#e3e9f2] pt-4">
                      <div>
                        <p className="text-xs text-[#8ea0b7]">{t.fromPrice}</p>
                        <p className="font-bold text-[#1e3a5f]">{service.price_from} EUR / {priceUnit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8ea0b7]">{t.bookings}</p>
                        <p className="font-bold text-[#1e3a5f]">{service.bookings}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <Badge className={service.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}>
                        {statusLabel}
                      </Badge>
                      <Button variant="outline" size="sm" className="border-[#dbe3ee]" onClick={() => openEditDialog(service)}>
                        {t.edit}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService ? t.editTitle : t.createTitle}</DialogTitle>
          </DialogHeader>
          <DialogDescription className="sr-only">{t.createSubtitle}</DialogDescription>
          <form className="space-y-6" onSubmit={submitService}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="service-name-de">{t.nameGerman} *</Label>
                <Input id="service-name-de" value={serviceForm.name_de} onChange={(event) => updateForm("name_de", event.target.value)} autoFocus />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-name-ar">{t.nameArabic}</Label>
                <Input id="service-name-ar" value={serviceForm.name_ar} onChange={(event) => updateForm("name_ar", event.target.value)} dir="rtl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-name-en">{t.nameEnglish}</Label>
                <Input id="service-name-en" value={serviceForm.name_en} onChange={(event) => updateForm("name_en", event.target.value)} dir="ltr" />
              </div>
            </div>
            <LocalizedDescription id="service-description-de" label={t.descriptionGerman} value={serviceForm.description_de} onChange={(value) => updateForm("description_de", value)} />
            <LocalizedDescription id="service-description-ar" label={t.descriptionArabic} value={serviceForm.description_ar} onChange={(value) => updateForm("description_ar", value)} dir="rtl" />
            <LocalizedDescription id="service-description-en" label={t.descriptionEnglish} value={serviceForm.description_en} onChange={(value) => updateForm("description_en", value)} dir="ltr" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>{t.category}</Label>
                <Select value={serviceForm.category} onValueChange={(value) => updateForm("category", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(t.categories).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-price">{t.priceFrom} (EUR)</Label>
                <Input id="service-price" type="number" min="0" step="0.01" inputMode="decimal" value={serviceForm.price_from} onChange={(event) => updateForm("price_from", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t.priceUnit}</Label>
                <Select value={serviceForm.price_unit} onValueChange={(value) => updateForm("price_unit", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(t.priceUnits).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#f6f8fb] px-4 py-5">
              <div><p className="font-semibold text-[#1e3a5f]">{t.activeLabel}</p><p className="mt-1 text-sm text-[#65758b]">{t.activeHint}</p></div>
              <Switch
                checked={serviceForm.is_active}
                onCheckedChange={(value) => setServiceForm((current) => ({
                  ...current,
                  is_active: value,
                  status: value ? "active" : "inactive",
                }))}
                aria-label={t.activeLabel}
              />
            </div>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSaving}>
                {t.cancel}
              </Button>
              <Button type="submit" className="bg-[#1e3a5f] hover:bg-[#2d5a8a]" disabled={isSaving}>
                {isSaving ? t.saving : editingService ? t.update : t.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deletingService)} onOpenChange={(open) => !open && setDeletingService(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.deleteDescription.replace("{name}", deletingService?.[`name_${language}`] || deletingService?.name || "")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteServiceMutation.isPending}>{t.deleteCancel}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteServiceMutation.isPending}
              onClick={() => deletingService && deleteServiceMutation.mutate(deletingService.id)}
            >
              {deleteServiceMutation.isPending ? t.deleting : t.deleteConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LocalizedDescription({ id, label, value, onChange, dir }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} rows={3} dir={dir} /></div>;
}
