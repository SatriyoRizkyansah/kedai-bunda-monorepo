import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { notify } from "@/lib/notify";
import api from "@/lib/api";
import type { StokLog as StokLogType, BahanBaku } from "@/lib/types";
import { StokStatsCard } from "./stok-log/StokStatsCard";
import { StokLogFilters } from "./stok-log/StokLogFilters";
import { StokLogTable } from "./stok-log/StokLogTable";
import { StokLogDialog } from "./stok-log/StokLogDialog";
import { INITIAL_FORM_DATA } from "./stok-log/utils";
import type { StokStats, StokLogFormData, StokLogTipe } from "./stok-log/types";

export const StokLogPage = () => {
  // Main data states
  const [stokLogs, setStokLogs] = useState<StokLogType[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<StokLogType[]>([]);
  const [bahanBakuList, setBahanBakuList] = useState<BahanBaku[]>([]);
  const [stats, setStats] = useState<StokStats>({
    total_masuk: 0,
    total_keluar: 0,
    total_penyesuaian: 0,
  });

  // Loading states
  const [loading, setLoading] = useState(true);
  const [dialogLoading, setDialogLoading] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [tipeFilter, setTipeFilter] = useState<StokLogTipe>("semua");

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"tambah" | "kurangi">("tambah");
  const [formData, setFormData] = useState<StokLogFormData>(INITIAL_FORM_DATA);

  // Initialize
  useEffect(() => {
    fetchStokLogs();
    fetchBahanBaku();
  }, []);

  // Filter logs when search or tipe filter changes
  useEffect(() => {
    filterLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, tipeFilter, stokLogs]);

  // Fetch stok logs
  const fetchStokLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get("/stok-log");
      const logs = response.data.data || [];
      setStokLogs(logs);
      calculateStats(logs);
    } catch (error) {
      console.error("Error fetching stok logs:", error);
      notify.error("Gagal memuat data stok log");
    } finally {
      setLoading(false);
    }
  };

  // Fetch bahan baku
  const fetchBahanBaku = async () => {
    try {
      const response = await api.get("/bahan-baku");
      setBahanBakuList(response.data.data || []);
    } catch (error) {
      console.error("Error fetching bahan baku:", error);
      notify.error("Gagal memuat data bahan baku");
    }
  };

  // Calculate stats from logs
  const calculateStats = (logs: StokLogType[]) => {
    const stats = logs.reduce(
      (acc, log) => {
        if (log.tipe === "masuk") acc.total_masuk += Number(log.jumlah);
        if (log.tipe === "keluar") acc.total_keluar += Number(log.jumlah);
        if (log.tipe === "penyesuaian") acc.total_penyesuaian += 1;
        return acc;
      },
      { total_masuk: 0, total_keluar: 0, total_penyesuaian: 0 }
    );
    setStats(stats);
  };

  // Filter logs by search and tipe
  const filterLogs = () => {
    let filtered = [...stokLogs];

    // Filter by search query (bahan baku name)
    if (searchQuery) {
      filtered = filtered.filter((log) =>
        log.bahan_baku?.nama
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tipe
    if (tipeFilter !== "semua") {
      filtered = filtered.filter((log) => log.tipe === tipeFilter);
    }

    setFilteredLogs(filtered);
  };

  // Dialog handlers
  const handleOpenDialog = (type: "tambah" | "kurangi") => {
    setDialogType(type);
    setFormData(INITIAL_FORM_DATA);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData(INITIAL_FORM_DATA);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDialogLoading(true);

    try {
      const endpoint =
        dialogType === "tambah" ? "/stok-log/tambah" : "/stok-log/kurangi";
      await api.post(endpoint, {
        bahan_baku_id: parseInt(formData.bahan_baku_id),
        jumlah: parseFloat(formData.jumlah),
        keterangan: formData.keterangan,
      });

      notify.success(
        `Stok berhasil ${dialogType === "tambah" ? "ditambahkan" : "dikurangi"}`
      );
      handleCloseDialog();
      fetchStokLogs();
    } catch (error: any) {
      console.error("Error:", error);
      notify.error(
        error.response?.data?.pesan || "Gagal menyimpan data"
      );
    } finally {
      setDialogLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Filters Section */}
        <StokLogFilters
          searchQuery={searchQuery}
          tipeFilter={tipeFilter}
          onSearchChange={setSearchQuery}
          onTipeFilterChange={setTipeFilter}
          onTambahClick={() => handleOpenDialog("tambah")}
          onKurangiClick={() => handleOpenDialog("kurangi")}
        />

        {/* Stats Section */}
        <div className="mb-8">
          <StokStatsCard stats={stats} />
        </div>

        {/* Table Section */}
        <StokLogTable logs={filteredLogs} loading={loading} />

        {/* Dialog */}
        <StokLogDialog
          open={dialogOpen}
          type={dialogType}
          formData={formData}
          bahanBakuList={bahanBakuList}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          onOpenChange={handleCloseDialog}
          isLoading={dialogLoading}
        />
      </div>
    </DashboardLayout>
  );
};
