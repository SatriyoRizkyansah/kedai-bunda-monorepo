import { useState, useEffect } from "react";
import api from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/LoadingScreen";
import { notify } from "@/lib/notify";
import { Plus, Users as UsersIcon, Trash2, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "kasir";
  aktif: boolean;
  created_at: string;
  updated_at?: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  role: "super_admin" | "admin" | "kasir";
  aktif: boolean;
}

const INITIAL_FORM: FormData = {
  name: "",
  email: "",
  password: "",
  role: "admin",
  aktif: true,
};

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      notify.error("Gagal memuat data pengguna");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        aktif: user.aktif,
      });
    } else {
      setEditingUser(null);
      setFormData(INITIAL_FORM);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setFormData(INITIAL_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        aktif: formData.aktif,
      };

      // Password hanya required saat create
      if (!editingUser && !formData.password) {
        notify.error("Password wajib diisi untuk pengguna baru");
        setFormLoading(false);
        return;
      }

      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload);
        notify.success("Pengguna berhasil diperbarui");
      } else {
        await api.post("/users", payload);
        notify.success("Pengguna berhasil dibuat");
      }

      handleCloseDialog();
      fetchUsers();
    } catch (error: any) {
      console.error("Error:", error);
      notify.error(error?.response?.data?.pesan || "Gagal menyimpan pengguna");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setDeleteTarget(user);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      notify.success("Pengguna berhasil dihapus");
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error:", error);
      notify.error(error?.response?.data?.pesan || "Gagal menghapus pengguna");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400";
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400";
      case "kasir":
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Pengguna</h2>
            <p className="text-muted-foreground mt-2">Kelola akun pengguna sistem</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Pengguna
          </Button>
        </div>

        {/* Role Guide Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-semibold mb-2">Panduan Role:</p>
              <ul className="space-y-1 text-xs">
                <li>
                  <strong>Super Admin:</strong> Akses penuh ke semua fitur termasuk manajemen pengguna
                </li>
                <li>
                  <strong>Admin:</strong> Dapat mengelola stok, menu, bahan baku, dan melihat laporan
                </li>
                <li>
                  <strong>Kasir:</strong> Hanya dapat melakukan transaksi penjualan
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <LoadingScreen message="Memuat data pengguna..." size="md" />
        ) : (
          <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>{user.role === "super_admin" ? "Super Admin" : user.role === "admin" ? "Admin" : "Kasir"}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={user.aktif ? "default" : "secondary"}>{user.aktif ? "Aktif" : "Nonaktif"}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(user.created_at).toLocaleDateString("id-ID")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleOpenDialog(user)} className="gap-1">
                            <Edit2 className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteClick(user)} className="gap-1 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <UsersIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                      Belum ada pengguna
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}</DialogTitle>
              <DialogDescription>{editingUser ? "Ubah data pengguna yang sudah terdaftar" : "Buat akun pengguna baru di sistem"}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium">
                  Nama Lengkap
                </label>
                <Input id="name" placeholder="Masukkan nama lengkap" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <Input id="email" type="email" placeholder="contoh@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required disabled={!!editingUser} />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                  {editingUser && <span className="text-xs text-muted-foreground ml-2">(kosongkan jika tidak ingin mengubah)</span>}
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder={editingUser ? "Biarkan kosong jika tidak ingin mengubah" : "Minimal 6 karakter"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-medium">
                  Role
                </label>
                <select id="role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as any })} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground">
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="kasir">Kasir</option>
                </select>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="aktif" checked={formData.aktif} onChange={(e) => setFormData({ ...formData, aktif: e.target.checked })} className="rounded" />
                <label htmlFor="aktif" className="cursor-pointer text-sm font-medium">
                  Pengguna Aktif
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog} className="flex-1">
                  Batal
                </Button>
                <Button type="submit" disabled={formLoading} className="flex-1">
                  {formLoading ? "Menyimpan..." : editingUser ? "Update" : "Buat"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Hapus Pengguna</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus pengguna <strong>{deleteTarget?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="flex-1" disabled={deleteLoading}>
                Batal
              </Button>
              <Button type="button" variant="destructive" onClick={handleConfirmDelete} className="flex-1" disabled={deleteLoading}>
                {deleteLoading ? "Menghapus..." : "Hapus"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
