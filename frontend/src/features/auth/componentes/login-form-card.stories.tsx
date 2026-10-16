import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoginFormCard } from "./login-form-card";

const meta: Meta<typeof LoginFormCard> = {
  title: "Features/Auth/LoginFormCard",
  component: LoginFormCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SocialTab: Story = {
  args: {
    onGoogleClick: () => console.log("Google clicked"),
    onGuestClick: () => console.log("Guest clicked"),
    onEmailSuccess: () => console.log("Email success"),
    tabActivo: "social",
    onCambiarTab: () => undefined,
    googlePending: false,
  },
};

export const EmailTab: Story = {
  args: {
    ...SocialTab.args,
    tabActivo: "email",
  },
};

export const Pending: Story = {
  args: {
    ...SocialTab.args,
    guestPending: true,
  },
};

export const ErrorState: Story = {
  args: {
    ...SocialTab.args,
    guestError: true,
  },
};
