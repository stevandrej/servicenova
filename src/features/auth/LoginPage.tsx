import { Sparkles } from "../../components/sparkles/Sparkles";
import { GoogleLoginButton } from "./components/GoogleLoginButton/GoogleLoginButton";

export const LoginPage = () => {
  return (
    <Sparkles title="Service Nova" fullHeight>
      <div className="flex align-middle justify-center mt-10">
        <GoogleLoginButton />
      </div>
    </Sparkles>
  );
};
