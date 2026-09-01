import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, FolderOpen, MessageSquare, Search, UserRound, Users } from "lucide-react";
import { clientWorkspaceAdminApi } from "@/api/backendClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAdminText } from "@/lib/adminLocalization";

const labels = {
  ar: {
    title: "مساحة عمل العملاء", subtitle: "متابعة عملاء المستخدمين وطلبات التواصل والملفات والفواتير.", search: "ابحث بالعميل أو الشركة أو صاحب الحساب...",
    owner: "صاحب الحساب", requests: "الطلبات", communication: "التواصل", files: "الملفات", invoices: "الفواتير", history: "السجل", noClients: "لا يوجد عملاء مضافون حتى الآن.",
    select: "اختر عميلًا لعرض ملفه", noRequests: "لا توجد طلبات لهذا العميل.", complete: "تحديد كمكتمل", inProgress: "قيد المعالجة", open: "مفتوح", clientSince: "أضيف في",
  },
  en: {
    title: "Client Workspace", subtitle: "Review customer-managed clients, communication, files and invoices.", search: "Search client, company, or account owner...",
    owner: "Account owner", requests: "Requests", communication: "Communication", files: "Files", invoices: "Invoices", history: "History", noClients: "No clients have been added yet.",
    select: "Select a client to view the workspace", noRequests: "There are no requests for this client.", complete: "Mark complete", inProgress: "In progress", open: "Open", clientSince: "Added",
  },
  de: {
    title: "Kundenbereich", subtitle: "Kunden, Kommunikation, Dateien und Rechnungen verwalten.", search: "Kunde, Unternehmen oder Kontoinhaber suchen...",
    owner: "Kontoinhaber", requests: "Anfragen", communication: "Kommunikation", files: "Dateien", invoices: "Rechnungen", history: "Verlauf", noClients: "Noch keine Kunden vorhanden.",
    select: "Kunden auswaehlen, um den Bereich zu sehen", noRequests: "Keine Anfragen fuer diesen Kunden.", complete: "Als erledigt markieren", inProgress: "In Bearbeitung", open: "Offen", clientSince: "Hinzugefuegt",
  },
};

export default function ClientWorkspace() {
  const lang = localStorage.getItem("einstein_lang") || "ar";
  const t = labels[lang] || labels.ar;
  const adminT = getAdminText(lang);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const queryClient = useQueryClient();
  const { data: clients = [], isLoading } = useQuery({ queryKey: ["admin-client-workspaces", search], queryFn: () => clientWorkspaceAdminApi.list({ search }) });
  const { data: workspace, isLoading: isLoadingWorkspace } = useQuery({ queryKey: ["admin-client-workspace", selectedId], queryFn: () => clientWorkspaceAdminApi.get(selectedId), enabled: Boolean(selectedId) });
  const updateRequest = useMutation({
    mutationFn: ({ requestId, status }) => clientWorkspaceAdminApi.updateRequest(selectedId, requestId, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-client-workspace", selectedId] }),
  });

  return <div className="min-h-screen bg-[#f6f8fb] py-8" dir={lang === "ar" ? "rtl" : "ltr"}>
    <div className="mx-auto max-w-7xl px-4">
      <div className="mb-7"><p className="text-sm font-semibold text-[#c9a227]">{adminT.common.clientWorkspaceBreadcrumb}</p><h1 className="mt-1 text-3xl font-bold text-[#1e3a5f]">{t.title}</h1><p className="mt-2 text-sm text-[#65758b]">{t.subtitle}</p></div>
      <Card className="mb-6 border-[#e3e9f2]"><CardContent className="p-4"><div className="relative"><Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8ea0b7]" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.search} className="ps-10" /></div></CardContent></Card>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        <Card className="border-[#e3e9f2]"><CardHeader><CardTitle className="flex items-center gap-2 text-[#1e3a5f]"><Users className="h-5 w-5" />{t.title}</CardTitle></CardHeader><CardContent className="space-y-3">
          {isLoading ? <p className="text-sm text-[#65758b]">...</p> : clients.length === 0 ? <p className="text-sm text-[#65758b]">{t.noClients}</p> : clients.map((client) => <button key={client.id} onClick={() => setSelectedId(client.id)} className={`w-full rounded-md border p-4 text-start ${selectedId === client.id ? "border-[#c9a227] bg-[#fffdf5]" : "border-[#e3e9f2] bg-white"}`}><p className="font-bold text-[#1e3a5f]">{client.full_name}</p><p className="mt-1 text-xs text-[#65758b]">{client.company_name || client.email || "-"}</p><p className="mt-2 text-xs text-[#65758b]">{t.owner}: {client.owner_name || client.owner_email}</p><div className="mt-3 flex gap-2"><Badge variant="outline">{client.open_requests_count} {t.requests}</Badge><Badge variant="outline">{client.files_count} {t.files}</Badge></div></button>)}
        </CardContent></Card>
        <Card className="border-[#e3e9f2]"><CardContent className="p-6">{!selectedId ? <p className="py-20 text-center text-[#65758b]">{t.select}</p> : isLoadingWorkspace ? <p className="py-20 text-center text-[#65758b]">...</p> : <WorkspaceDetail workspace={workspace} t={t} onUpdate={(requestId, status) => updateRequest.mutate({ requestId, status })} />}</CardContent></Card>
      </div>
    </div>
  </div>;
}

function WorkspaceDetail({ workspace, t, onUpdate }) {
  return <div className="space-y-7"><div className="flex flex-col justify-between gap-4 md:flex-row"><div><h2 className="text-2xl font-bold text-[#1e3a5f]">{workspace.full_name}</h2><p className="mt-1 text-sm text-[#65758b]">{workspace.company_name || workspace.email || workspace.phone || "-"}</p><p className="mt-2 text-sm text-[#65758b]">{t.owner}: {workspace.owner_name || workspace.owner_email}</p></div><Badge className="h-fit w-fit bg-[#eef3f9] text-[#1e3a5f]">{workspace.status}</Badge></div>
    <Section title={t.requests} icon={FileText}>{workspace.requests?.length ? workspace.requests.map((item) => <div key={item.id} className="mb-3 rounded-md border border-[#e3e9f2] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold text-[#1e3a5f]">{item.subject}</p><p className="mt-1 text-sm text-[#65758b]">{item.description}</p><p className="mt-2 text-xs text-[#8ea0b7]">{item.number} · {item.priority}</p></div><div className="flex items-center gap-2"><Badge variant="outline">{item.status}</Badge>{item.status !== "completed" && <Button size="sm" variant="outline" onClick={() => onUpdate(item.id, "completed")}>{t.complete}</Button>}{item.status === "open" && <Button size="sm" onClick={() => onUpdate(item.id, "in_progress")}>{t.inProgress}</Button>}</div></div></div>) : <p className="text-sm text-[#65758b]">{t.noRequests}</p>}</Section>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><Section title={t.communication} icon={MessageSquare}>{workspace.communications?.map((item) => <div key={item.id} className="mb-3 border-b border-[#e3e9f2] pb-3"><p className="font-semibold text-[#1e3a5f]">{item.channel}: {item.summary}</p><p className="text-sm text-[#65758b]">{item.translated_summary || item.details}</p></div>) || "-"}</Section><Section title={t.files} icon={FolderOpen}>{workspace.files?.length ? workspace.files.map((item) => <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="mb-2 block text-sm font-medium text-[#1e3a5f] underline">{item.name}</a>) : "-"}</Section></div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><Section title={t.invoices} icon={FileText}>{workspace.invoices?.length ? workspace.invoices.map((item) => <p key={item.id} className="mb-2 text-sm text-[#334155]">{item.number} · {item.title} · {item.amount.toFixed(2)} {item.currency}</p>) : "-"}</Section><Section title={t.history} icon={UserRound}>{workspace.history?.length ? workspace.history.map((item) => <p key={item.id} className="mb-2 text-sm text-[#334155]">{item.title}</p>) : "-"}</Section></div>
  </div>;
}

function Section({ title, icon: Icon, children }) { return <section><h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-[#1e3a5f]"><Icon className="h-5 w-5" />{title}</h3>{children}</section>; }
