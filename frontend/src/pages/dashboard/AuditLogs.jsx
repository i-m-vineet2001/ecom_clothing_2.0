import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import api from "../../lib/api";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api
      .get("/audit-logs")
      .then((res) => setLogs(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="p-8">
      <h1 className="font-heading text-4xl font-semibold text-[#2C2C2C] mb-8">
        System Audit Trail
      </h1>
      <div className="space-y-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-5 bg-white border border-[#F2F0EB] rounded-xl flex items-center justify-between hover:border-[#C5A059] transition-all shadow-sm"
          >
            <div className="flex items-center gap-5">
              <div className="bg-[#F9F8F5] p-3 rounded-full">
                <ShieldCheck className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#2C2C2C] font-bold">
                  <span className="text-[#C5A059]">{log.user_email}</span>{" "}
                  {log.action}
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-bold">
                  Target: {log.resource_type}
                </p>
              </div>
            </div>
            <p className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
              {new Date(log.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AuditLogs;
