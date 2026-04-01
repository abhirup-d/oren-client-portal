import { ClientForm } from "@/components/admin/client-form";

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Add Client</h1>
      <ClientForm />
    </div>
  );
}
