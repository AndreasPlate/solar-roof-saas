import { GlobalHeader } from "@/components/global-header";
import { HeaderDivider } from "@/components/ui/header-divider";
import { MainContainer } from "@/components/ui/main-container";

interface AppShellProps {
  children: React.ReactNode;
  headerProps: React.ComponentProps<typeof GlobalHeader>;
  showHeaderDivider?: boolean;
  containerMaxWidth?: React.ComponentProps<typeof MainContainer>['maxWidth'];
  containerClassName?: string;
  shellClassName?: string;
}

export function AppShell({ 
  children, 
  headerProps, 
  showHeaderDivider = true,
  containerMaxWidth = 'xl',
  containerClassName = "",
  shellClassName = ""
}: AppShellProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${shellClassName}`}>
      <GlobalHeader {...headerProps} />
      {showHeaderDivider && <HeaderDivider />}
      <MainContainer maxWidth={containerMaxWidth} className={containerClassName}>
        <main className="py-6">
          {children}
        </main>
      </MainContainer>
    </div>
  );
}