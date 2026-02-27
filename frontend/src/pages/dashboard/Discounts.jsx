import React, { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "../../lib/api";

const Discounts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // limit=500 is used here to avoid the 422 error
    api
      .get("/products?limit=500&include_inactive=true")
      .then((res) => {
        const activeDiscounts = res.data.filter((p) => p.discount?.active);
        setProducts(activeDiscounts);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h1 className="font-heading text-4xl font-semibold text-[#2C2C2C] mb-8">
        Active Discounts
      </h1>
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <Card
              key={p.id}
              className="border-[#F2F0EB] hover:border-[#C5A059] transition-all"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge className="bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/20 font-bold">
                    {p.discount.type === "percentage"
                      ? `${p.discount.value}% OFF`
                      : `₹${p.discount.value} OFF`}
                  </Badge>
                  <Tag className="w-5 h-5 text-gray-300" />
                </div>
                <CardTitle className="text-lg mt-2 text-[#2C2C2C]">
                  {p.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-400 font-mono mb-4">{p.sku}</p>
                <div className="text-sm font-bold text-[#2C2C2C]">
                  Base Price: ₹{p.base_price}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
export default Discounts;
