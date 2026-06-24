import { AppLayout } from "../../layouts/app-layout/app-layout";
import { makeMockAppLayoutProps } from "../../layouts/app-layout/app-layout.mock";
import { SignupFormPresentational } from "../../organisms/auth/signup-form/signup-form";
import { makeMockSignupFormProps } from "../../organisms/auth/signup-form/signup-form.mock";

export const Default = () => (
  <AppLayout
    {...makeMockAppLayoutProps({
      pageHeader: (
        <h1 className="text-3xl font-black uppercase tracking-tight text-brand-dark">
          Become a member
        </h1>
      ),
      pageBody: <SignupFormPresentational {...makeMockSignupFormProps()} />,
    })}
  />
);

export default {
  title: "Pages / Auth / Signup",
  parameters: { layout: "fullscreen", ladle: { skipCoverage: true } },
};
