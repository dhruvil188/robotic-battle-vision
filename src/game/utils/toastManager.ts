
import { toast } from "@/hooks/use-toast";

export const showWeaponUpgradeToast = (weaponName: string, level: number) => {
  const upgradeMessages = [
    "Weapon acquired!",
    "Weapon upgraded to MK2!",
    "Weapon upgraded to MK3!",
    "Maximum upgrade reached!"
  ];

  toast({
    title: upgradeMessages[level - 1],
    description: `${weaponName} is now more powerful!`,
    variant: level >= 3 ? "destructive" : "default",
    duration: 3000,
  });
};

export const showEnemyDefeatedToast = (isBoss: boolean) => {
  if (isBoss) {
    toast({
      title: "Boss Defeated!",
      description: "You've destroyed a powerful enemy!",
      variant: "destructive",
      duration: 3000,
    });
  } else {
    // Regular enemies don't need toast notifications every time
    // But we could add a counter and show milestone toasts
  }
};

export const showWeaponChangeToast = (weaponName: string) => {
  toast({
    title: "Weapon Changed",
    description: `Switched to ${weaponName}`,
    duration: 2000,
  });
};
