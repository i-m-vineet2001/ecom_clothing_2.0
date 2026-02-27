import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Mail, Clock } from "lucide-react";
import api from "../../lib/api";

const Enquiries = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    api
      .get("/enquiries")
      .then((res) => setData(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="p-8">
      <h1 className="font-heading text-4xl font-semibold text-[#2C2C2C] mb-8">
        Customer Enquiries
      </h1>
      <div className="bg-white border border-[#F2F0EB] rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-[#F9F8F5]">
            <TableRow className="border-b-[#F2F0EB]">
              <TableHead className="text-[#2C2C2C] font-bold py-4 px-6">
                Customer
              </TableHead>
              <TableHead className="text-[#2C2C2C] font-bold">
                Message Content
              </TableHead>
              <TableHead className="text-[#2C2C2C] font-bold">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow
                key={item.id}
                className="hover:bg-[#F9F8F5]/50 border-b-[#F2F0EB]"
              >
                <TableCell className="py-4 px-6">
                  <div className="font-medium text-[#2C2C2C]">{item.name}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                    <Mail className="w-3 h-3" /> {item.email}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600 italic">
                  "{item.message}"
                </TableCell>
                <TableCell className="text-xs text-gray-400 font-mono">
                  {new Date(item.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
export default Enquiries;
