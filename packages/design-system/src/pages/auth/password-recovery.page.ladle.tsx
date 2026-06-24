import { AppLayout } from "../../layouts/app-layout/app-layout";
import { makeMockAppLayoutProps } from "../../layouts/app-layout/app-layout.mock";
import { PasswordRecoveryFormPresentational } from "../../organisms/auth/password-recovery-form/password-recovery-form";
import { makeMockPasswordRecoveryFormProps } from "../../organisms/auth/password-recovery-form/password-recovery-form.mock";

export const Default = () => (
  <AppLayout
    {...makeMockAppLayoutProps({
      pageHeader: (
        <h1 className="text-3xl font-black uppercase tracking-tight text-brand-dark">
          Reset password
        </h1>
      ),
      pageBody: (
        <PasswordRecoveryFormPresentational
          {...makeMockPasswordRecoveryFormProps()}
        />
      ),
    })}
  />
);

export default {
  title: "Pages / Auth / Password recovery",
  parameters: { layout: "fullscreen", ladle: { skipCoverage: true } },
};
