import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  Briefcase,
  Clock,
  FileText,
  Languages,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Search,
  ShieldAlert,
  UserCheck,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { providersApi } from "@/api/backendClient";

const categoryLabels = {
  office: "Buero",
  forms: "Formulare",
  admin: "Administration",
  coordination: "Koordination",
  mercosur: "MERCOSUR",
  tutoring: "Nachhilfe",
  print: "Druck"
};

const statusMeta = {
  approved: {
    label: "Genehmigt",
    icon: BadgeCheck,
    className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
  },
  pending: {
    label: "Ausstehend",
    icon: Clock,
    className: "bg-amber-100 text-amber-700 hover:bg-amber-100"
  },
  suspended: {
    label: "Gesperrt",
    icon: ShieldAlert,
    className: "bg-slate-100 text-slate-700 hover:bg-slate-100"
  },
  rejected: {
    label: "Abgelehnt",
    icon: ShieldAlert,
    className: "bg-red-100 text-red-700 hover:bg-red-100"
  }
};

export default function Providers() {
  const [search, setSearch] = useState("");
  const { data: backendProviders = [] } = useQuery({
    queryKey: ["admin-providers"],
    queryFn: () => providersApi.listProviders("all"),
  });
  const providers = backendProviders;

  const filteredProviders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return providers;
    return providers.filter((provider) =>
      [
        provider.full_name,
        provider.email,
        provider.city,
        (provider.categories || []).join(" "),
        (provider.languages || []).join(" ")
      ].join(" ").toLowerCase().includes(term)
    );
  }, [search, providers]);

  const approved = providers.filter((provider) => provider.status === "approved").length;
  const pending = providers.filter((provider) => provider.status === "pending").length;
  const documents = providers.reduce((sum, provider) => sum + Number(provider.documents || 0), 0);

  return (
    <div className="min-h-screen bg-[#f6f8fb] py-8">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <p className="mb-2 text-sm font-semibold text-[#c9a227]">Admin / Fachkraefte</p>
            <h1 className="text-3xl font-bold text-[#1e3a5f]">Fachkraefte verwalten</h1>
            <p className="mt-2 text-sm text-[#65758b]">
              Statische Designansicht fuer Service Provider, Dokumente, Kategorien und Status.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="border-[#dbe3ee]">
              Export
            </Button>
            <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
              <UserCheck className="mr-2 h-4 w-4" />
              Fachkraft hinzufuegen
            </Button>
          </div>
        </motion.div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          {[
            { label: "Fachkraefte", value: providers.length, icon: Users },
            { label: "Genehmigt", value: approved, icon: BadgeCheck },
            { label: "Ausstehend", value: pending, icon: Clock },
            { label: "Dokumente", value: documents, icon: FileText }
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
                placeholder="Fachkraft suchen..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filteredProviders.map((provider, index) => {
            const status = statusMeta[provider.status] || statusMeta.pending;
            const StatusIcon = status.icon;
            return (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full border-[#e3e9f2] shadow-sm transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-md bg-[#1e3a5f] text-xl font-bold text-white">
                          {provider.full_name.charAt(0)}
                        </div>
                        <div>
                          <CardTitle className="text-xl text-[#1e3a5f]">{provider.full_name}</CardTitle>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge className={status.className}>
                              <StatusIcon className="mr-1 h-3.5 w-3.5" />
                              {status.label}
                            </Badge>
                            <Badge variant="outline" className="border-[#dbe3ee] text-[#65758b]">
                              {provider.total_jobs} Auftraege
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3 text-sm text-[#65758b] md:grid-cols-2">
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#8ea0b7]" />
                        {provider.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[#8ea0b7]" />
                        {provider.phone}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#8ea0b7]" />
                        {provider.city}
                      </p>
                      <p className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#8ea0b7]" />
                        {provider.documents} Dokumente
                      </p>
                    </div>

                    <div className="mt-5 space-y-4 border-t border-[#e3e9f2] pt-4">
                      <div>
                        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8ea0b7]">
                          <Briefcase className="h-4 w-4" />
                          Kategorien
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(provider.categories || []).map((category) => (
                            <Badge key={category} variant="outline" className="border-[#dbe3ee] bg-white text-[#1e3a5f]">
                              {categoryLabels[category] || category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8ea0b7]">
                          <Languages className="h-4 w-4" />
                          Sprachen
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(provider.languages || []).map((language) => (
                            <Badge key={language} className="bg-[#eef3f9] text-[#1e3a5f] hover:bg-[#eef3f9]">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-[#e3e9f2] pt-4">
                      <div>
                        <p className="text-xs text-[#8ea0b7]">Stundensatz</p>
                        <p className="font-bold text-[#1e3a5f]">{provider.hourly_rate} EUR / Stunde</p>
                      </div>
                      <Button variant="outline" className="border-[#dbe3ee]">
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
