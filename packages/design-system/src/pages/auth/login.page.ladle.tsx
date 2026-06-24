import { AppLayout } from "../../layouts/app-layout/app-layout";
import { makeMockAppLayoutProps } from "../../layouts/app-layout/app-layout.mock";
import { LoginFormPresentational } from "../../organisms/auth/login-form/login-form";
import { makeMockLoginFormProps } from "../../organisms/auth/login-form/login-form.mock";

export const Default = () => (
  <AppLayout
    {...makeMockAppLayoutProps({
      pageHeader: (
        <h1 className="text-3xl font-black uppercase tracking-tight text-brand-dark">
          Log in
        </h1>
      ),
      pageBody: <LoginFormPresentational {...makeMockLoginFormProps()} />,
    })}
  />
);

export default {
  title: "Pages / Auth / Login",
  parameters: { layout: "fullscreen", ladle: { skipCoverage: true } },
};
