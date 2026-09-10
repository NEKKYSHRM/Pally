"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";


export default function Sidebar() {
  const pathname = usePathname();

  const isChatsActive =
    pathname === "/chats" ||
    pathname.startsWith("/chats/");

  const isBotActive =
    pathname === "/bot" ||
    pathname.startsWith("/bot/");

  const isProfileActive =
    pathname === "/profile" ||
    pathname.startsWith("/profile/");

  return (
    <>
      {/* =========================================================
          Desktop Sidebar
      ========================================================== */}

      <aside className="relative z-20 hidden w-[250px] shrink-0 border-r border-[#eee9e4] bg-[#fffdfb]/90 px-5 py-7 backdrop-blur-sm lg:flex lg:flex-col xl:w-[290px] xl:px-7">
        {/* Logo */}

        <Link
          href="/chats"
          className="flex items-center px-2"
        >
          <span className="text-[36px] font-bold tracking-[-1.8px] text-[#202733]">
            Pally
          </span>

          <span className="ml-1 -mt-1 text-[31px] leading-none">
            🐾
          </span>
        </Link>


        {/* Navigation */}

        <nav className="mt-12 space-y-2">
          <SidebarItem
            href="/chats"
            active={isChatsActive}
            icon={<ChatIcon />}
            label="Chats"
          />

          <SidebarItem
            href="/bot"
            active={isBotActive}
            icon={<BotIcon />}
            label="My Pally"
          />

          <SidebarItem
            href="/profile"
            active={isProfileActive}
            icon={<ProfileIcon />}
            label="Profile"
          />
        </nav>


        {/* Bottom sidebar */}

        <div className="mt-auto">
          <button
            type="button"
            className="flex w-full items-center gap-5 rounded-2xl px-4 py-3.5 text-[17px] text-[#4f5968] transition hover:bg-[#fff3e8]"
          >
            <LogoutIcon />

            <span>
              Log out
            </span>
          </button>

          <div className="mt-8 px-2 text-[15px] leading-[1.5] text-[#8a95a5]">
            <p>
              Little pets.
            </p>

            <p>
              Brighter friendships.
            </p>
          </div>
        </div>
      </aside>


      {/* =========================================================
          Mobile Bottom Navigation
      ========================================================== */}

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-[72px] items-center justify-around border-t border-[#eee8e2] bg-[#fffdfb]/95 px-5 backdrop-blur-md lg:hidden">
        <MobileNavItem
          href="/chats"
          active={isChatsActive}
          icon={<ChatIcon />}
          label="Chats"
        />

        <MobileNavItem
          href="/bot"
          active={isBotActive}
          icon={<BotIcon />}
          label="My Pally"
        />

        <MobileNavItem
          href="/profile"
          active={isProfileActive}
          icon={<ProfileIcon />}
          label="Profile"
        />
      </nav>
    </>
  );
}


/* ===============================================================
   Sidebar Item
================================================================ */

function SidebarItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-5 rounded-full px-5 py-3.5 text-[17px] transition ${
        active
          ? "bg-[#fff0e3] text-[#202733]"
          : "text-[#596373] hover:bg-[#fff5ed]"
      }`}
    >
      {icon}

      <span>
        {label}
      </span>
    </Link>
  );
}


/* ===============================================================
   Mobile Nav Item
================================================================ */

function MobileNavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex min-w-[75px] flex-col items-center gap-1 ${
        active
          ? "text-[#202733]"
          : "text-[#8a94a3]"
      }`}
    >
      <div
        className={`rounded-full px-4 py-1 ${
          active
            ? "bg-[#fff0e3]"
            : ""
        }`}
      >
        {icon}
      </div>

      <span className="text-[11px] font-medium">
        {label}
      </span>
    </Link>
  );
}


/* ===============================================================
   Icons
================================================================ */

function ChatIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.5 8.5 0 0 1-3.4-.7L4 20l1.5-3.8A7.2 7.2 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" />

      <circle
        cx="9"
        cy="12"
        r=".7"
        fill="currentColor"
      />

      <circle
        cx="12"
        cy="12"
        r=".7"
        fill="currentColor"
      />

      <circle
        cx="15"
        cy="12"
        r=".7"
        fill="currentColor"
      />
    </svg>
  );
}


function BotIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="4"
        y="7"
        width="16"
        height="12"
        rx="4"
      />

      <path d="M12 4v3" />

      <circle
        cx="12"
        cy="3"
        r="1"
      />

      <circle
        cx="9"
        cy="12"
        r="1"
        fill="currentColor"
      />

      <circle
        cx="15"
        cy="12"
        r="1"
        fill="currentColor"
      />

      <path d="M9 15c1 .8 2 1.2 3 1.2s2-.4 3-1.2" />
    </svg>
  );
}


function ProfileIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="12"
        cy="7"
        r="3.5"
      />

      <path d="M4.5 20c.8-3.5 3.4-5.5 7.5-5.5s6.7 2 7.5 5.5" />
    </svg>
  );
}


function LogoutIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 5H5v14h5" />

      <path d="M14 8l4 4-4 4" />

      <path d="M18 12H9" />
    </svg>
  );
}