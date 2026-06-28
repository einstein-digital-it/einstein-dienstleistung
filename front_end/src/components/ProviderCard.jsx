import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import {
  Star,
  Briefcase,
  Globe,
  CheckCircle,
  ArrowRight,
  GraduationCap,
  FileText,
  Sparkles,
  Truck,
  Wrench,
  Palette,
  ClipboardList,
  Settings,
  BookOpen,
  Printer
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const categoryIcons = {
  office: Briefcase,
  forms: ClipboardList,
  admin: FileText,
  coordination: Settings,
  mercosur: Globe,
  tutoring: BookOpen,
  print: Printer
};

const categoryColors = {
  office: "bg-purple-100 text-purple-700",
  forms: "bg-teal-100 text-teal-700",
  admin: "bg-green-100 text-green-700",
  coordination: "bg-indigo-100 text-indigo-700",
  mercosur: "bg-amber-100 text-amber-700",
  tutoring: "bg-blue-100 text-blue-700",
  print: "bg-pink-100 text-pink-700"
};

export default function ProviderCard({ provider, translations, lang, getCategoryName }) {
  const t = translations;

  const getBio = () => {
    if (lang === "ar" && provider.bio_ar) return provider.bio_ar;
    if (lang === "en" && provider.bio_en) return provider.bio_en;
    return provider.bio_de || "";
  };

  const bio = getBio();

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Avatar */}
          <Avatar className="w-16 h-16 flex-shrink-0">
            {provider.profile_image ? (
              <AvatarImage src={provider.profile_image} alt={provider.full_name} />
            ) : (
              <AvatarFallback className="bg-[#c9a227] text-[#1e3a5f] text-xl font-bold">
                {provider.full_name?.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>

          {/* Info */}
          <div className="flex-grow min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#1e3a5f] truncate">
                  {provider.full_name}
                </h3>
                {provider.status === "approved" && (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                )}
              </div>
              {provider.hourly_rate && (
                <span className="text-[#c9a227] font-bold whitespace-nowrap">
                  {provider.hourly_rate}€/h
                </span>
              )}
            </div>

            {/* Rating & Jobs */}
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
              {provider.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>{provider.rating.toFixed(1)}</span>
                </div>
              )}
              {provider.total_jobs > 0 && (
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  <span>{provider.total_jobs}</span>
                </div>
              )}
              {provider.languages?.length > 0 && (
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>{provider.languages.slice(0, 2).join(", ")}</span>
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-1 mb-3">
              {provider.categories?.slice(0, 3).map((cat) => {
                const Icon = categoryIcons[cat];
                return (
                  <Badge
                    key={cat}
                    className={`${categoryColors[cat]} text-xs`}
                  >
                    {Icon && <Icon className="w-3 h-3 me-1" />}
                    {getCategoryName ? getCategoryName(cat) : (t.categories?.[cat] || cat)}
                  </Badge>
                );
              })}
            </div>

            {/* Bio */}
            {bio && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {bio}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Link to={createPageUrl(`ProviderProfile?id=${provider.id}`)}>
                <Button variant="outline" size="sm">
                  {t.view_profile}
                </Button>
              </Link>
              <Link to={createPageUrl(`Booking?provider=${provider.id}`)}>
                <Button size="sm" className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
                  {t.book_now}
                  <ArrowRight className="w-3 h-3 ms-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}