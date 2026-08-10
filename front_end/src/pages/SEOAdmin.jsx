import React, { useState, useEffect } from "react";
import { seoSettingsApi } from "@/api/backendClient";
import { requireStoredUser } from "@/lib/backendAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search,
  Settings,
  Globe,
  FileText,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const availablePages = [
  "Home",
  "Services",
  "Booking",
  "MyBookings",
  "ProviderApplication",
  "ProvidersList",
  "Profile"
];

const translations = {
  de: {
    title: "SEO Einstellungen",
    pages: "Seiten",
    sitemap: "Sitemap",
    add_page: "Seite hinzufügen",
    edit_seo: "SEO bearbeiten",
    page_name: "Seitenname",
    meta_title: "Meta-Titel",
    meta_description: "Meta-Beschreibung",
    keywords: "Schlüsselwörter",
    og_image: "Open Graph Bild",
    canonical_url: "Kanonische URL",
    no_index: "Von Indexierung ausschließen",
    priority: "Priorität",
    change_frequency: "Änderungshäufigkeit",
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    generate_sitemap: "Sitemap generieren",
    copy_sitemap: "Sitemap kopieren",
    german: "Deutsch",
    arabic: "Arabisch",
    english: "Englisch",
    no_settings: "Keine SEO-Einstellungen gefunden",
    delete_confirm: "Möchten Sie diese SEO-Einstellungen wirklich löschen?",
    saved: "Gespeichert",
    copied: "Kopiert"
  },
  ar: {
    title: "إعدادات SEO",
    pages: "الصفحات",
    sitemap: "خريطة الموقع",
    add_page: "إضافة صفحة",
    edit_seo: "تعديل SEO",
    page_name: "اسم الصفحة",
    meta_title: "عنوان Meta",
    meta_description: "وصف Meta",
    keywords: "الكلمات المفتاحية",
    og_image: "صورة Open Graph",
    canonical_url: "الرابط الأساسي",
    no_index: "استبعاد من الفهرسة",
    priority: "الأولوية",
    change_frequency: "تكرار التغيير",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    generate_sitemap: "إنشاء خريطة الموقع",
    copy_sitemap: "نسخ خريطة الموقع",
    german: "ألماني",
    arabic: "عربي",
    english: "إنجليزي",
    no_settings: "لا توجد إعدادات SEO",
    delete_confirm: "هل تريد حذف هذه الإعدادات؟",
    saved: "تم الحفظ",
    copied: "تم النسخ"
  },
  en: {
    title: "SEO Settings",
    pages: "Pages",
    sitemap: "Sitemap",
    add_page: "Add Page",
    edit_seo: "Edit SEO",
    page_name: "Page Name",
    meta_title: "Meta Title",
    meta_description: "Meta Description",
    keywords: "Keywords",
    og_image: "Open Graph Image",
    canonical_url: "Canonical URL",
    no_index: "Exclude from indexing",
    priority: "Priority",
    change_frequency: "Change Frequency",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    generate_sitemap: "Generate Sitemap",
    copy_sitemap: "Copy Sitemap",
    german: "German",
    arabic: "Arabic",
    english: "English",
    no_settings: "No SEO settings found",
    delete_confirm: "Are you sure you want to delete these SEO settings?",
    saved: "Saved",
    copied: "Copied"
  }
};

const frequencyOptions = [
  { value: "always", label: "Always" },
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "never", label: "Never" }
];

export default function SEOAdmin() {
  const [lang, setLang] = useState("ar");
  const [user, setUser] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [formData, setFormData] = useState({});
  const [sitemapXml, setSitemapXml] = useState("");
  const [notification, setNotification] = useState(null);

  const queryClient = useQueryClient();
  const t = translations[lang] || translations.de;

  useEffect(() => {
    const savedLang = localStorage.getItem("einstein_lang");
    if (savedLang) setLang(savedLang);

    const checkUser = () => setUser(requireStoredUser({ role: "admin" }));
    checkUser();
  }, []);

  const { data: seoSettings = [], isLoading } = useQuery({
    queryKey: ["seo-settings"],
    queryFn: seoSettingsApi.listSettings,
    enabled: !!user
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        return seoSettingsApi.updateSetting(data.id, data);
      }
      return seoSettingsApi.createSetting(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-settings"] });
      setShowDialog(false);
      showNotification(t.saved, "success");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: seoSettingsApi.deleteSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-settings"] });
      setShowDeleteAlert(false);
      setSelectedSetting(null);
    }
  });

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleEdit = (setting) => {
    setSelectedSetting(setting);
    setFormData(setting || {});
    setShowDialog(true);
  };

  const handleAdd = () => {
    setSelectedSetting(null);
    setFormData({
      page_name: "",
      priority: 0.5,
      change_frequency: "weekly",
      no_index: false
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const generateSitemap = () => {
    const baseUrl = window.location.origin;
    const today = new Date().toISOString().split("T")[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    seoSettings.forEach((setting) => {
      if (!setting.no_index) {
        xml += `  <url>
    <loc>${baseUrl}/${setting.page_name}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${setting.change_frequency || "weekly"}</changefreq>
    <priority>${setting.priority || 0.5}</priority>
  </url>
`;
      }
    });

    xml += `</urlset>`;
    setSitemapXml(xml);
  };

  const copySitemap = () => {
    navigator.clipboard.writeText(sitemapXml);
    showNotification(t.copied, "success");
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-[#1e3a5f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Notification */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
              notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {notification.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {notification.message}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#1e3a5f] flex items-center gap-3">
            <Search className="w-8 h-8" />
            {t.title}
          </h1>
        </motion.div>

        <Tabs defaultValue="pages" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {t.pages}
            </TabsTrigger>
            <TabsTrigger value="sitemap" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {t.sitemap}
            </TabsTrigger>
          </TabsList>

          {/* Pages Tab */}
          <TabsContent value="pages">
            <div className="flex justify-end mb-4">
              <Button onClick={handleAdd} className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
                <Plus className="w-4 h-4 me-2" />
                {t.add_page}
              </Button>
            </div>

            {seoSettings.length === 0 ? (
              <Card className="text-center p-12">
                <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{t.no_settings}</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {seoSettings.map((setting) => (
                  <Card key={setting.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-[#1e3a5f]">
                              {setting.page_name}
                            </h3>
                            {setting.no_index && (
                              <Badge variant="outline" className="text-red-600 border-red-300">
                                No Index
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {setting.meta_title_de || setting.meta_title_en || "-"}
                          </p>
                          <div className="flex gap-4 text-xs text-gray-500">
                            <span>Priority: {setting.priority || 0.5}</span>
                            <span>Frequency: {setting.change_frequency || "weekly"}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(setting)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setSelectedSetting(setting);
                              setShowDeleteAlert(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Sitemap Tab */}
          <TabsContent value="sitemap">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Sitemap XML
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={generateSitemap} className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
                    <RefreshCw className="w-4 h-4 me-2" />
                    {t.generate_sitemap}
                  </Button>
                  {sitemapXml && (
                    <Button variant="outline" onClick={copySitemap}>
                      <Copy className="w-4 h-4 me-2" />
                      {t.copy_sitemap}
                    </Button>
                  )}
                </div>
                {sitemapXml && (
                  <Textarea
                    value={sitemapXml}
                    readOnly
                    rows={15}
                    className="font-mono text-sm"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.edit_seo}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Page Name */}
              <div>
                <Label>{t.page_name}</Label>
                <Select
                  value={formData.page_name || ""}
                  onValueChange={(value) => setFormData({ ...formData, page_name: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select page" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePages.map((page) => (
                      <SelectItem key={page} value={page}>
                        {page}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Meta Titles */}
              <Tabs defaultValue="de">
                <TabsList className="mb-4">
                  <TabsTrigger value="de">🇩🇪 {t.german}</TabsTrigger>
                  <TabsTrigger value="ar">🇸🇦 {t.arabic}</TabsTrigger>
                  <TabsTrigger value="en">🇬🇧 {t.english}</TabsTrigger>
                </TabsList>

                {["de", "ar", "en"].map((langCode) => (
                  <TabsContent key={langCode} value={langCode} className="space-y-4">
                    <div>
                      <Label>{t.meta_title}</Label>
                      <Input
                        value={formData[`meta_title_${langCode}`] || ""}
                        onChange={(e) => setFormData({ ...formData, [`meta_title_${langCode}`]: e.target.value })}
                        placeholder="Max 60 characters"
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(formData[`meta_title_${langCode}`] || "").length}/60
                      </p>
                    </div>
                    <div>
                      <Label>{t.meta_description}</Label>
                      <Textarea
                        value={formData[`meta_description_${langCode}`] || ""}
                        onChange={(e) => setFormData({ ...formData, [`meta_description_${langCode}`]: e.target.value })}
                        placeholder="Max 160 characters"
                        maxLength={160}
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(formData[`meta_description_${langCode}`] || "").length}/160
                      </p>
                    </div>
                    <div>
                      <Label>{t.keywords}</Label>
                      <Input
                        value={formData[`keywords_${langCode}`] || ""}
                        onChange={(e) => setFormData({ ...formData, [`keywords_${langCode}`]: e.target.value })}
                        placeholder="keyword1, keyword2, keyword3"
                      />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              {/* Other Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t.og_image}</Label>
                  <Input
                    value={formData.og_image || ""}
                    onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>{t.canonical_url}</Label>
                  <Input
                    value={formData.canonical_url || ""}
                    onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t.priority} (0.0 - 1.0)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.priority || 0.5}
                    onChange={(e) => setFormData({ ...formData, priority: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>{t.change_frequency}</Label>
                  <Select
                    value={formData.change_frequency || "weekly"}
                    onValueChange={(value) => setFormData({ ...formData, change_frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.no_index || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, no_index: checked })}
                />
                <Label>{t.no_index}</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                {t.cancel}
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.page_name || saveMutation.isPending}
                className="bg-[#c9a227] hover:bg-[#e6c14a] text-[#1e3a5f]"
              >
                <Save className="w-4 h-4 me-2" />
                {t.save}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Alert */}
        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.delete}</AlertDialogTitle>
              <AlertDialogDescription>{t.delete_confirm}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => deleteMutation.mutate(selectedSetting?.id)}
              >
                {t.delete}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
