import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, Upload, Trash2, Shield, Award, FileBadge, CheckCircle, Download, Eye } from "lucide-react";
import { format } from "date-fns";

const docTypeIcons = {
  certificate: Award,
  license: FileBadge,
  insurance: Shield,
  id: FileText,
  other: FileText
};

const docTypeColors = {
  certificate: "bg-yellow-100 text-yellow-800",
  license: "bg-blue-100 text-blue-800",
  insurance: "bg-green-100 text-green-800",
  id: "bg-purple-100 text-purple-800",
  other: "bg-gray-100 text-gray-700"
};

const tr = {
  de: {
    title: "Meine Dokumente",
    upload_new: "Neues Dokument hochladen",
    doc_name: "Name des Dokuments",
    doc_type: "Dokumentart",
    file: "Datei",
    uploading: "Wird hochgeladen...",
    save: "Speichern",
    no_docs: "Keine Dokumente gefunden",
    all: "Alle",
    types: {
      certificate: "Zertifikat",
      license: "Arbeitslizenz",
      insurance: "Versicherungsnachweis",
      id: "Ausweis",
      other: "Sonstiges"
    },
    delete: "Löschen",
    view: "Ansehen",
    download: "Herunterladen",
    uploaded: "Hochgeladen"
  },
  ar: {
    title: "مستنداتي",
    upload_new: "رفع مستند جديد",
    doc_name: "اسم المستند",
    doc_type: "نوع المستند",
    file: "الملف",
    uploading: "جاري الرفع...",
    save: "حفظ",
    no_docs: "لا توجد مستندات",
    all: "الكل",
    types: {
      certificate: "شهادة",
      license: "ترخيص عمل",
      insurance: "إثبات تأمين",
      id: "هوية",
      other: "أخرى"
    },
    delete: "حذف",
    view: "عرض",
    download: "تحميل",
    uploaded: "تاريخ الرفع"
  },
  en: {
    title: "My Documents",
    upload_new: "Upload New Document",
    doc_name: "Document Name",
    doc_type: "Document Type",
    file: "File",
    uploading: "Uploading...",
    save: "Save",
    no_docs: "No documents found",
    all: "All",
    types: {
      certificate: "Certificate",
      license: "Work License",
      insurance: "Insurance Proof",
      id: "ID",
      other: "Other"
    },
    delete: "Delete",
    view: "View",
    download: "Download",
    uploaded: "Uploaded"
  }
};

export default function ProviderDocumentsTab({ providerId, lang = "de" }) {
  const [uploading, setUploading] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: "", type: "certificate", file_url: "" });
  const [filterType, setFilterType] = useState("all");
  const queryClient = useQueryClient();
  const t = tr[lang] || tr.de;

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["provider-documents", providerId],
    queryFn: () => base44.entities.ProviderDocument.filter({ provider_id: providerId }, "-created_date")
  });

  const createDocMutation = useMutation({
    mutationFn: (data) => base44.entities.ProviderDocument.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-documents", providerId] });
      setNewDoc({ name: "", type: "certificate", file_url: "" });
    }
  });

  const deleteDocMutation = useMutation({
    mutationFn: (id) => base44.entities.ProviderDocument.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["provider-documents", providerId] })
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setNewDoc(prev => ({ ...prev, file_url }));
    setUploading(false);
  };

  const handleSave = () => {
    if (!newDoc.name || !newDoc.file_url) return;
    createDocMutation.mutate({
      ...newDoc,
      provider_id: providerId,
      upload_date: new Date().toISOString()
    });
  };

  const filteredDocs = filterType === "all" ? documents : documents.filter(d => d.type === filterType);

  // Count per type
  const countByType = documents.reduce((acc, d) => {
    acc[d.type] = (acc[d.type] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin w-8 h-8 text-[#6B46C1]" /></div>;

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#1e3a5f]">
            <Upload className="w-5 h-5 text-[#6B46C1]" />
            {t.upload_new}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{t.doc_name}</Label>
              <Input
                value={newDoc.name}
                onChange={e => setNewDoc(prev => ({ ...prev, name: e.target.value }))}
                placeholder={lang === "ar" ? "مثال: شهادة ماجستير" : lang === "en" ? "e.g. Master's Certificate" : "z.B. Masterurkunde"}
              />
            </div>
            <div>
              <Label>{t.doc_type}</Label>
              <Select value={newDoc.type} onValueChange={v => setNewDoc(prev => ({ ...prev, type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(t.types).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">{label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>{t.file}</Label>
              <div className="flex items-center gap-3 mt-1">
                <Input type="file" onChange={handleFileUpload} disabled={uploading} className="flex-1" />
                {uploading && <Loader2 className="animate-spin w-5 h-5 text-gray-500 flex-shrink-0" />}
                {newDoc.file_url && !uploading && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
              </div>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={!newDoc.name || !newDoc.file_url || uploading || createDocMutation.isPending}
            className="bg-[#6B46C1] hover:bg-[#805AD5] text-white"
          >
            {createDocMutation.isPending ? <Loader2 className="animate-spin w-4 h-4 me-2" /> : <Upload className="w-4 h-4 me-2" />}
            {t.save}
          </Button>
        </CardContent>
      </Card>

      {/* Documents List with filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-[#1e3a5f]">{t.title} ({documents.length})</CardTitle>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterType === "all" ? "bg-[#6B46C1] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {t.all} ({documents.length})
              </button>
              {Object.entries(t.types).map(([key, label]) => countByType[key] ? (
                <button
                  key={key}
                  onClick={() => setFilterType(key)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterType === key ? "bg-[#6B46C1] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {label} ({countByType[key]})
                </button>
              ) : null)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">{t.no_docs}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocs.map(doc => {
                const Icon = docTypeIcons[doc.type] || FileText;
                const colorClass = docTypeColors[doc.type] || docTypeColors.other;
                const isImage = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(doc.file_url);
                return (
                  <div key={doc.id} className="flex items-start gap-3 p-4 border rounded-xl bg-gray-50 hover:bg-white hover:shadow-sm transition-all">
                    {isImage ? (
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                        <img src={doc.file_url} alt={doc.name} className="w-14 h-14 object-cover rounded-lg border" />
                      </a>
                    ) : (
                      <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm border flex-shrink-0 text-[#6B46C1]">
                        <Icon className="w-7 h-7" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1e3a5f] truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge className={`text-xs ${colorClass} border-0`}>{t.types[doc.type] || doc.type}</Badge>
                        <span className="text-xs text-gray-400">{format(new Date(doc.upload_date || doc.created_date), "dd.MM.yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#6B46C1] hover:underline"
                        >
                          <Eye className="w-3 h-3" />
                          {t.view}
                        </a>
                        <a
                          href={doc.file_url}
                          download
                          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                          <Download className="w-3 h-3" />
                          {t.download}
                        </a>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                      onClick={() => deleteDocMutation.mutate(doc.id)}
                      disabled={deleteDocMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}