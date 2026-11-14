import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BookOpen,
  Briefcase,
  ClipboardList,
  Euro,
  FileText,
  Globe,
  Plus,
  Printer,
  Save,
  Settings,
  Trash2,
  TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { priceAdminApi } from "@/api/backendClient";
import { getAdminLocale, getAdminText } from "@/lib/adminLocalization";

const icons = [ClipboardList, Settings, Briefcase, Printer, Globe, BookOpen, FileText];
const LANGS = [
  { code: "de", label: "DE" },
  { code: "en", label: "EN" },
  { code: "tr", label: "TR" },
  { code: "ar", label: "AR", dir: "rtl" },
];

const withLocalizedDefaults = (item) => ({
  ...item,
  label_de: item.label_de ?? item.label ?? "",
  unit_de: item.unit_de ?? item.unit ?? "",
});

export default function PriceAdmin() {
  const t = getAdminText(getAdminLocale()).prices;
  const { data: backendPriceGroups = [] } = useQuery({
    queryKey: ["admin-price-groups"],
    queryFn: priceAdminApi.listPriceGroups,
  });
  const queryClient = useQueryClient();
  const [priceGroups, setPriceGroups] = useState([]);
  const [dirtyIds, setDirtyIds] = useState(new Set());

  // Copy server data into local editable state (only when nothing is being edited)
  useEffect(() => {
    if (dirtyIds.size === 0) {
      setPriceGroups(backendPriceGroups.map((group) => ({ ...group, items: group.items.map(withLocalizedDefaults) })));
    }
  }, [backendPriceGroups]); // eslint-disable-line react-hooks/exhaustive-deps

  const markDirty = (groupId) => setDirtyIds((current) => new Set(current).add(groupId));

  const updateItem = (groupId, itemIndex, field, value) => {
    setPriceGroups((groups) => groups.map((group) => (
      group.id !== groupId ? group : {
        ...group,
        items: group.items.map((item, index) => (index === itemIndex ? { ...item, [field]: value } : item)),
      }
    )));
    markDirty(groupId);
  };

  const addItem = (groupId) => {
    setPriceGroups((groups) => groups.map((group) => (
      group.id !== groupId ? group : {
        ...group,
        items: [...group.items, { label_de: "", label_en: "", label_tr: "", label_ar: "", price: "", unit_de: "", unit_en: "", unit_tr: "", unit_ar: "", status: "active", _key: `new-${Date.now()}` }],
      }
    )));
    markDirty(groupId);
  };

  const removeItem = (groupId, itemIndex) => {
    setPriceGroups((groups) => groups.map((group) => (
      group.id !== groupId ? group : { ...group, items: group.items.filter((_, index) => index !== itemIndex) }
    )));
    markDirty(groupId);
  };

  const saveMutation = useMutation({
    mutationFn: async (groups) => Promise.all(groups.map((group) => priceAdminApi.updatePriceGroup(group.id, {
      category: group.category,
      items: group.items
        .filter((item) => LANGS.some(({ code }) => String(item[`label_${code}`] ?? "").trim() !== ""))
        .map((item, index) => {
          const clean = (value) => (value && String(value).trim() ? String(value).trim() : null);
          const payload = { price: String(item.price ?? "").trim(), status: item.status || "active", sort_order: index };
          LANGS.forEach(({ code }) => {
            payload[`label_${code}`] = clean(item[`label_${code}`]);
            payload[`unit_${code}`] = clean(item[`unit_${code}`]);
          });
          return payload;
        }),
    }))),
    onSuccess: () => {
      setDirtyIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["admin-price-groups"] });
      toast.success(t.saved);
    },
    onError: () => toast.error(t.saveError),
  });

  const createGroupMutation = useMutation({
    mutationFn: (category) => priceAdminApi.createPriceGroup({ category, items: [] }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-price-groups"] }),
    onError: () => toast.error(t.saveError),
  });

  const handleSave = () => {
    const changed = priceGroups.filter((group) => dirtyIds.has(group.id));
    if (changed.length) saveMutation.mutate(changed);
  };

  const handleAddGroup = () => {
    const name = window.prompt(t.newGroupPrompt);
    if (name && name.trim()) createGroupMutation.mutate(name.trim());
  };
  const itemCount = priceGroups.reduce((sum, group) => sum + group.items.length, 0);
  const numericPrices = priceGroups
    .flatMap((group) => group.items)
    .map((item) => parseFloat(String(item.price).replace(/[^\d.,]/g, "").replace(",", ".")))
    .filter((value) => !Number.isNaN(value));
  const averagePrice = numericPrices.length
    ? `${Math.round(numericPrices.reduce((sum, value) => sum + value, 0) / numericPrices.length)} EUR`
    : "0 EUR";

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
            <Button variant="outline" className="border-[#dbe3ee]" onClick={handleAddGroup} disabled={createGroupMutation.isPending}>
              <Plus className="mr-2 h-4 w-4" />
              {t.add}
            </Button>
            <Button
              className="bg-[#1e3a5f] hover:bg-[#2d5a8a]"
              onClick={handleSave}
              disabled={dirtyIds.size === 0 || saveMutation.isPending}
              title={dirtyIds.size > 0 ? t.unsaved : undefined}
            >
              <Save className="mr-2 h-4 w-4" />
              {saveMutation.isPending ? t.saving : t.save}
              {dirtyIds.size > 0 && !saveMutation.isPending ? " •" : ""}
            </Button>
          </div>
        </motion.div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { label: t.groups, value: priceGroups.length, icon: ClipboardList },
            { label: t.items, value: itemCount, icon: Euro },
            { label: t.average, value: averagePrice, icon: TrendingUp }
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

        <div className="space-y-5">
          {priceGroups.map((group, index) => {
            const Icon = icons[index % icons.length];
            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden border-[#e3e9f2] shadow-sm">
                  <CardHeader className="border-b border-[#e3e9f2] bg-white">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <CardTitle className="flex items-center gap-3 text-xl text-[#1e3a5f]">
                        <span className="rounded-md bg-[#1e3a5f] p-2 text-white">
                          <Icon className="h-5 w-5" />
                        </span>
                        {group.category}
                      </CardTitle>
                      <Badge className="w-fit bg-[#fff6d9] text-[#8a6a00] hover:bg-[#fff6d9]">
                        {group.items.length} {t.positions}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[900px] text-sm">
                        <thead className="bg-[#f8fbff] text-[#65758b]">
                          <tr>
                            <th className="px-5 py-4 text-start font-semibold">{t.label}</th>
                            <th className="px-5 py-4 text-start font-semibold">{t.price}</th>
                            <th className="px-5 py-4 text-start font-semibold">{t.unit}</th>
                            <th className="px-5 py-4 text-start font-semibold">{t.status}</th>
                            <th className="px-5 py-4" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e3e9f2]">
                          {group.items.map((item, itemIndex) => (
                            <tr key={item.id ?? item._key ?? itemIndex} className="bg-white">
                              <td className="px-5 py-4 align-top">
                                <div className="grid grid-cols-1 gap-2">
                                  {LANGS.map(({ code, label, dir }) => (
                                    <div key={code} className="flex items-center gap-2">
                                      <span className="w-7 text-xs font-semibold text-[#65758b]">{label}</span>
                                      <Input dir={dir} value={item[`label_${code}`] ?? ""} onChange={(event) => updateItem(group.id, itemIndex, `label_${code}`, event.target.value)} className="border-[#dbe3ee] bg-white" />
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="px-5 py-4 align-top">
                                <Input value={item.price ?? ""} onChange={(event) => updateItem(group.id, itemIndex, "price", event.target.value)} className="max-w-[180px] border-[#dbe3ee] bg-white font-bold text-[#1e3a5f]" />
                              </td>
                              <td className="px-5 py-4 align-top">
                                <div className="grid grid-cols-1 gap-2">
                                  {LANGS.map(({ code, label, dir }) => (
                                    <div key={code} className="flex items-center gap-2">
                                      <span className="w-7 text-xs font-semibold text-[#65758b]">{label}</span>
                                      <Input dir={dir} value={item[`unit_${code}`] ?? ""} onChange={(event) => updateItem(group.id, itemIndex, `unit_${code}`, event.target.value)} className="max-w-[180px] border-[#dbe3ee] bg-white" />
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{t.active}</Badge>
                              </td>
                              <td className="px-5 py-4 text-end">
                                <Button variant="ghost" size="icon" title={t.remove} onClick={() => removeItem(group.id, itemIndex)}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-end border-t border-[#e3e9f2] bg-[#fbfdff] p-4">
                      <Button variant="outline" className="border-[#dbe3ee]" onClick={() => addItem(group.id)}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t.addItem}
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
