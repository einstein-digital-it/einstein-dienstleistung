import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
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
  TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { priceAdminApi } from "@/api/backendClient";
import { staticPriceGroups } from "@/lib/staticAdminData";

const icons = [ClipboardList, Settings, Briefcase, Printer, Globe, BookOpen, FileText];

export default function PriceAdmin() {
  const { data: backendPriceGroups = [] } = useQuery({
    queryKey: ["admin-price-groups"],
    queryFn: priceAdminApi.listPriceGroups,
  });
  const priceGroups = backendPriceGroups.length > 0 ? backendPriceGroups : staticPriceGroups;
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
            <p className="mb-2 text-sm font-semibold text-[#c9a227]">Admin / Preise</p>
            <h1 className="text-3xl font-bold text-[#1e3a5f]">Preise verwalten</h1>
            <p className="mt-2 text-sm text-[#65758b]">
              Statische Designansicht fuer Preislisten, Einheiten und Dienstleistungspakete.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="border-[#dbe3ee]">
              <Plus className="mr-2 h-4 w-4" />
              Preis hinzufuegen
            </Button>
            <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
              <Save className="mr-2 h-4 w-4" />
              Design speichern
            </Button>
          </div>
        </motion.div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { label: "Preisgruppen", value: priceGroups.length, icon: ClipboardList },
            { label: "Preispositionen", value: itemCount, icon: Euro },
            { label: "Durchschnitt", value: averagePrice, icon: TrendingUp }
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
                        {group.items.length} Positionen
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[720px] text-sm">
                        <thead className="bg-[#f8fbff] text-[#65758b]">
                          <tr>
                            <th className="px-5 py-4 text-left font-semibold">Bezeichnung</th>
                            <th className="px-5 py-4 text-left font-semibold">Preis</th>
                            <th className="px-5 py-4 text-left font-semibold">Einheit</th>
                            <th className="px-5 py-4 text-left font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e3e9f2]">
                          {group.items.map((item) => (
                            <tr key={`${group.id}-${item.label}`} className="bg-white">
                              <td className="px-5 py-4">
                                <Input value={item.label} readOnly className="border-[#dbe3ee] bg-white" />
                              </td>
                              <td className="px-5 py-4">
                                <Input value={item.price} readOnly className="max-w-[180px] border-[#dbe3ee] bg-white font-bold text-[#1e3a5f]" />
                              </td>
                              <td className="px-5 py-4">
                                <Input value={item.unit} readOnly className="max-w-[180px] border-[#dbe3ee] bg-white" />
                              </td>
                              <td className="px-5 py-4">
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Aktiv</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-end border-t border-[#e3e9f2] bg-[#fbfdff] p-4">
                      <Button variant="outline" className="border-[#dbe3ee]">
                        <Plus className="mr-2 h-4 w-4" />
                        Position hinzufuegen
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
