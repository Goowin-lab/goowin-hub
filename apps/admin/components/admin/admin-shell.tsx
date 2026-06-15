import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';

type AdminShellProps = {
  children: React.ReactNode;
  title: string;
  description?: string;
};

export function AdminShell({ children, title, description }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header title={title} description={description} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
