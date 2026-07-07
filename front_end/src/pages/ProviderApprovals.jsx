import React, { useState, useEffect } from "react";
import { providerApprovalsApi } from "@/api/backendClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Download, Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { requireStoredUser } from "@/lib/backendAuth";

const translations = {
  de: {
    title: "Fachkraft-Anträge verwalten",
    pending: "Ausstehend",
    approved: "Genehmigt",
    rejected: "Abgelehnt",
    noRequests: "Keine Anträge",
    approve: "Genehmigen",
    reject: "Ablehnen",
    loading: "Lädt...",
    documents: "Dokumente",
    experience: "Erfahrung",
    years: "Jahre",
    categories: "Kategorien",
    languages: "Sprachen"
  },
  ar: {
    title: "إدارة طلبات مزودي الخدمة",
    pending: "قيد الانتظار",
    approved: "موافق عليه",
    rejected: "مرفوض",
    noRequests: "لا توجد طلبات",
    approve: "الموافقة",
    reject: "الرفض",
    loading: "جاري التحميل...",
    documents: "المستندات",
    experience: "الخبرة",
    years: "سنوات",
    categories: "الفئات",
    languages: "اللغات"
  },
  en: {
    title: "Manage Provider Applications",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    noRequests: "No applications",
    approve: "Approve",
    reject: "Reject",
    loading: "Loading...",
    documents: "Documents",
    experience: "Experience",
    years: "Years",
    categories: "Categories",
    languages: "Languages"
  }
};

export default function ProviderApprovals() {
  const [lang, setLang] = useState("de");
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [resendingId, setResendingId] = useState(null);
  const queryClient = useQueryClient();
  const t = translations[lang];
  const { toast } = useToast();

  useEffect(() => {
    const init = () => {
      try {
        setUser(requireStoredUser({ role: "admin" }));
      } catch (e) {
        window.location.href = "/";
      }
    };
    init();
  }, []);

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["provider-applications", filter],
    queryFn: () => providerApprovalsApi.listApplications(filter),
    enabled: !!user?.email
  });

  const resendWelcomeEmail = async (provider) => {
    setResendingId(provider.id);
    try {
      await providerApprovalsApi.requestWelcomeEmail(provider.id);
      toast({ title: "✅ تم إرسال الإيميل بنجاح!", description: provider.email });
    } catch (e) {
      toast({ title: "❌ فشل الإرسال", description: e.message, variant: "destructive" });
    }
    setResendingId(null);
  };

  const approveMutation = useMutation({
    mutationFn: async (providerId) => {
      return providerApprovalsApi.approveProvider(providerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-applications"] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (providerId) => {
      return providerApprovalsApi.rejectProvider(providerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-applications"] });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B46C1]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t.title}</h1>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8">
          {["pending", "approved", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-[#6B46C1] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f === "pending" ? "⏳ قيد الانتظار" : f === "approved" ? "✅ موافق عليهم" : "📋 الكل"}
            </button>
          ))}
        </div>

        {providers.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-500">{t.noRequests}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {providers.map((provider) => (
              <Card key={provider.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {provider.profile_image && (
                        <img
                          src={provider.profile_image}
                          alt={provider.full_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <CardTitle className="text-xl">{provider.full_name}</CardTitle>
                        <p className="text-sm text-gray-600">{provider.email}</p>
                        <p className="text-sm text-gray-600">{provider.phone}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                      <Clock className="w-3 h-3 mr-1" />
                      {t.pending}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Bio */}
                    {provider.bio_de && (
                      <div>
                        <h3 className="font-semibold text-sm text-gray-700 mb-2">النبذة</h3>
                        <p className="text-sm text-gray-600">{provider.bio_de}</p>
                      </div>
                    )}

                    {/* Experience */}
                    {provider.experience_years && (
                      <div>
                        <h3 className="font-semibold text-sm text-gray-700 mb-2">{t.experience}</h3>
                        <p className="text-sm text-gray-600">{provider.experience_years} {t.years}</p>
                      </div>
                    )}

                    {/* Qualifications */}
                    {provider.qualifications && (
                      <div>
                        <h3 className="font-semibold text-sm text-gray-700 mb-2">المؤهلات</h3>
                        <p className="text-sm text-gray-600">{provider.qualifications}</p>
                      </div>
                    )}

                    {/* Categories */}
                    {provider.categories?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-sm text-gray-700 mb-2">{t.categories}</h3>
                        <div className="flex flex-wrap gap-2">
                          {provider.categories.map((cat) => (
                            <Badge key={cat} variant="secondary" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {provider.languages?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-sm text-gray-700 mb-2">{t.languages}</h3>
                        <div className="flex flex-wrap gap-2">
                          {provider.languages.map((lang) => (
                            <Badge key={lang} variant="outline" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Service Area */}
                    {provider.service_area && (
                      <div>
                        <h3 className="font-semibold text-sm text-gray-700 mb-2">منطقة الخدمة</h3>
                        <p className="text-sm text-gray-600">{provider.service_area}</p>
                      </div>
                    )}
                  </div>

                  {/* Documents */}
                  {provider.documents_urls?.length > 0 && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-sm text-gray-700 mb-3">{t.documents}</h3>
                      <div className="space-y-2">
                        {provider.documents_urls.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-[#6B46C1] hover:underline"
                          >
                            <Download className="w-4 h-4" />
                            {`Dokument ${idx + 1}`}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {provider.status === "pending" && (
                      <>
                        <Button
                          onClick={() => approveMutation.mutate(provider.id)}
                          disabled={approveMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {approveMutation.isPending ? t.loading : t.approve}
                        </Button>
                        <Button
                          onClick={() => rejectMutation.mutate(provider.id)}
                          disabled={rejectMutation.isPending}
                          variant="destructive"
                          className="gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          {rejectMutation.isPending ? t.loading : t.reject}
                        </Button>
                      </>
                    )}
                    {provider.status === "approved" && (
                      <Button
                        onClick={() => resendWelcomeEmail(provider)}
                        disabled={resendingId === provider.id}
                        className="bg-[#6B46C1] hover:bg-[#805AD5] text-white gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        {resendingId === provider.id ? "جاري الإرسال..." : "إعادة إرسال إيميل الترحيب"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
