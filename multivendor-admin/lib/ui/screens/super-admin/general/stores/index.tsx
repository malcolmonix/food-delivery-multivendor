'use client';
import StoresForm from '@/lib/ui/screen-components/protected/super-admin/stores/add-form';
import StoresScreenHeader from '@/lib/ui/screen-components/protected/super-admin/stores/view/header/screen-header';
import StoresScreenSubHeader from '@/lib/ui/screen-components/protected/super-admin/stores/view/header/screen-sub-header';
import StoresMain from '@/lib/ui/screen-components/protected/super-admin/stores/view/main/enhanced-index';

export default function StoresScreen() {
  return (
    <div className="screen-container">
      <StoresScreenHeader />
      <StoresScreenSubHeader />
      <StoresMain />
      <StoresForm />
    </div>
  );
}