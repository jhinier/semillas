import type { Meta, StoryObj } from "@storybook/react-vite";
import { SocialLoginButton } from "./social-login-button";
import googleIcon from "@/assets/images/icons/google.webp";
import guestIcon from "@/assets/images/icons/invitado.webp";

const meta: Meta<typeof SocialLoginButton> = {
  title: "Features/Auth/SocialLoginButton",
  component: SocialLoginButton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Google: Story = {
  args: {
    tipo: "google",
    logo: googleIcon,
    label: "Continuar con Google",
  },
};

export const Invitado: Story = {
  args: {
    tipo: "guest",
    logo: guestIcon,
    label: "Jugar como invitado",
    guestNote: "Explora sin cuenta. Tu progreso no se guardará.",
  },
};
