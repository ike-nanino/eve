// constant/index.ts
import {
  Home, Download, SendHorizontal, Wifi, CreditCard,
  DollarSign, Settings, Users, Banknote, Landmark,
  LayoutGrid, ArrowDownUp,
} from "lucide-react";

export const sidebarLinks = [
  { route: "/dashboard",         label: "Dashboard",         icon: Home          },
  { route: "/accounts",          label: "Accounts",          icon: LayoutGrid     },
  { route: "/online-deposit",    label: "Deposit",           icon: Download       },
  { route: "/domestic-transfer", label: "Send money",        icon: SendHorizontal },
  { route: "/wire-transfer",     label: "Wire transfer",     icon: Wifi           },
  { route: "/virtual-card",      label: "Cards",             icon: CreditCard     },
  { route: "/loan-mortgage",     label: "Loans",             icon: Banknote       },
  { route: "/transactions",      label: "Transactions",      icon: ArrowDownUp    },
  { route: "/withdrawal",        label: "Withdrawal",        icon: DollarSign     },
  { route: "/account-manager",   label: "Account manager",   icon: Users          },
  { route: "/settings",          label: "Settings",          icon: Settings       },
];
 
  
  export const topCategoryStyles = {
    "Food and Drink": {
      bg: "bg-blue-25",
      circleBg: "bg-blue-100",
      text: {
        main: "text-blue-900",
        count: "text-blue-700",
      },
      progress: {
        bg: "bg-blue-100",
        indicator: "bg-blue-700",
      },
      icon: "/icons/monitor.svg",
    },
    Travel: {
      bg: "bg-success-25",
      circleBg: "bg-success-100",
      text: {
        main: "text-success-900",
        count: "text-success-700",
      },
      progress: {
        bg: "bg-success-100",
        indicator: "bg-success-700",
      },
      icon: "/icons/coins.svg",
    },
    default: {
      bg: "bg-pink-25",
      circleBg: "bg-pink-100",
      text: {
        main: "text-pink-900",
        count: "text-pink-700",
      },
      progress: {
        bg: "bg-pink-100",
        indicator: "bg-pink-700",
      },
      icon: "/icons/shopping-bag.svg",
    },
  };
  
  export const transactionCategoryStyles = {
    "Food and Drink": {
      borderColor: "border-pink-600",
      backgroundColor: "bg-pink-500",
      textColor: "text-pink-700",
      chipBackgroundColor: "bg-inherit",
    },
    Payment: {
      borderColor: "border-success-600",
      backgroundColor: "bg-green-600",
      textColor: "text-success-700",
      chipBackgroundColor: "bg-inherit",
    },
    "Bank Fees": {
      borderColor: "border-success-600",
      backgroundColor: "bg-green-600",
      textColor: "text-success-700",
      chipBackgroundColor: "bg-inherit",
    },
    Transfer: {
      borderColor: "border-red-700",
      backgroundColor: "bg-red-700",
      textColor: "text-red-700",
      chipBackgroundColor: "bg-inherit",
    },
    Processing: {
      borderColor: "border-[#F2F4F7]",
      backgroundColor: "bg-gray-500",
      textColor: "text-[#344054]",
      chipBackgroundColor: "bg-[#F2F4F7]",
    },
    Success: {
      borderColor: "border-[#12B76A]",
      backgroundColor: "bg-[#12B76A]",
      textColor: "text-[#027A48]",
      chipBackgroundColor: "bg-[#ECFDF3]",
    },
    Travel: {
      borderColor: "border-[#0047AB]",
      backgroundColor: "bg-blue-500",
      textColor: "text-blue-700",
      chipBackgroundColor: "bg-[#ECFDF3]",
    },
    default: {
      borderColor: "",
      backgroundColor: "bg-blue-500",
      textColor: "text-blue-700",
      chipBackgroundColor: "bg-inherit",
    },
  };