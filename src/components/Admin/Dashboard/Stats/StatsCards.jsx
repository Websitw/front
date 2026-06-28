import { useTranslation } from "react-i18next";
import { Users, Package, ShoppingCart, Star } from "lucide-react";
import "./StatsCards.css";
import Card from "./Card/Card";
const StatsCards = () => {
  const { t } = useTranslation();

  const stats = [
    {
      id: 1,
      title: t("stats.totalMerchants"),
      value: "2",
      description: t("stats.merchantsDesc"),
      percentage: "+12%",
      icon: <Users size={24} />,
      details: [
        { label: t("stats.active"), value: "2" },
        { label: t("stats.pending"), value: "0" },
        { label: t("stats.inactive"), value: "0" },
      ],
    },
    {
      id: 2,
      title: t("stats.categories"),
      value: "4",
      description: t("stats.categoriesDesc"),
      percentage: "+8%",
      icon: <Package size={24} />,
    },
    {
      id: 3,
      title: t("stats.products"),
      value: "23",
      description: t("stats.productsDesc"),
      percentage: "+15%",
      icon: <ShoppingCart size={24} />,
    },
    {
      id: 4,
      title: t("stats.reviews"),
      value: "9",
      description: t("stats.reviewsDesc"),
      percentage: "+23%",
      icon: <Star size={24} />,
    },
  ];

  return (
    <div className="container-max">
    <div className="stats-cards-container">
      {stats.map((stat) => (
        <Card stat={stat} />
      ))}
    </div>
    </div>
  );
};

export default StatsCards;
