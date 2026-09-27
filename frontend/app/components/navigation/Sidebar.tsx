"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";

import type { AppDispatch } from "@/app/store/store";
import { logout } from "@/app/store/authSlice";

import {
  getReceivedConnectionRequests,
  sendConnectionRequest,
  updateConnectionStatus,
} from "@/app/lib/api/connectionApi";

import type { Connection } from "@/app/types/connection";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ---------------------------------------------------------------
  // Add Friend state
  // ---------------------------------------------------------------

  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ---------------------------------------------------------------
  // Friend Requests state
  // ---------------------------------------------------------------

  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const [requests, setRequests] = useState<Connection[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(
    null,
  );

  const isChatsActive = pathname === "/chats" || pathname.startsWith("/chats/");

  const isBotActive = pathname === "/bot" || pathname.startsWith("/bot/");

  const isProfileActive =
    pathname === "/profile" || pathname.startsWith("/profile/");

  // ===============================================================
  // Add Friend
  // ===============================================================

  const openAddFriendDialog = () => {
    setUsername("");
    setMessage("");
    setError("");
    setIsAddFriendOpen(true);
  };

  const closeAddFriendDialog = () => {
    if (isSubmitting) return;

    setIsAddFriendOpen(false);
    setUsername("");
    setMessage("");
    setError("");
  };

  const normalizedUsername = username.trim().replace(/^@/, "");

  const isUsernameValid = /^[a-zA-Z]{6}$/.test(normalizedUsername);

  const handleAddFriend = async () => {
    const trimmedUsername = username.trim();
    const normalizedUsername = trimmedUsername.replace(/^@/, "");

    if (!normalizedUsername) {
      setError("Please enter a username.");
      return;
    }

    if (!/^[a-zA-Z]+$/.test(normalizedUsername)) {
      setError("Username can only contain letters.");
      return;
    }

    if (normalizedUsername.length < 6) {
      setError("Username must be at least 6 characters.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setMessage("");

      await sendConnectionRequest({
        username: normalizedUsername,
      });

      setMessage("Friend request sent!");
      setUsername("");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to send friend request.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===============================================================
  // Friend Requests
  // ===============================================================

  const openRequestsDialog = async () => {
    setIsRequestsOpen(true);
    setRequestError("");
    setIsLoadingRequests(true);

    try {
      const receivedRequests = await getReceivedConnectionRequests();

      setRequests(receivedRequests);
    } catch (error) {
      if (error instanceof Error) {
        setRequestError(error.message);
      } else {
        setRequestError("Failed to load friend requests.");
      }
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const closeRequestsDialog = () => {
    if (processingRequestId) return;

    setIsRequestsOpen(false);
    setRequestError("");
  };

  const handleRequestAction = async (
    requestId: string,
    action: "accepted" | "rejected",
  ) => {
    try {
      setProcessingRequestId(requestId);
      setRequestError("");

      await updateConnectionStatus(requestId, {
        status: action,
      });

      // Remove the processed request from the dialog.
      setRequests((currentRequests) =>
        currentRequests.filter((request) => request.id !== requestId),
      );
    } catch (error) {
      if (error instanceof Error) {
        setRequestError(error.message);
      } else {
        setRequestError(
          `Failed to ${action === "accepted" ? "accept" : "reject"} request.`,
        );
      }
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to logout");
      }

      // Clear authentication state from Redux.
      dispatch(logout());

      // Send user to login page.
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* =========================================================
          Desktop Sidebar
      ========================================================== */}

      <aside className="sticky top-0 z-20 hidden h-screen w-[250px] shrink-0 overflow-hidden border-r border-[#eee9e4] bg-[#fffdfb]/90 px-5 py-7 backdrop-blur-sm lg:flex lg:flex-col xl:w-[290px] xl:px-7">
        {/* Logo */}

        <Link href="/chats" className="flex items-center px-2">
          <span className="text-[36px] font-bold tracking-[-1.8px] text-[#202733]">
            Pally
          </span>

          <span className="ml-1 -mt-1 text-[31px] leading-none">🐾</span>
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

          {/* Add Friend */}

          <button
            type="button"
            onClick={openAddFriendDialog}
            className="flex w-full items-center gap-5 rounded-full px-5 py-3.5 text-[17px] text-[#596373] transition hover:bg-[#fff5ed]"
          >
            <AddFriendIcon />

            <span>Add Friend</span>
          </button>

          {/* Friend Requests */}

          <button
            type="button"
            onClick={openRequestsDialog}
            className="flex w-full items-center gap-5 rounded-full px-5 py-3.5 text-[17px] text-[#596373] transition hover:bg-[#fff5ed]"
          >
            <FriendRequestsIcon />

            <span>Friend Requests</span>
          </button>
        </nav>

        {/* Bottom sidebar */}

        <div className="mt-auto">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-5 rounded-2xl px-4 py-3.5 text-[17px] text-[#4f5968] transition hover:bg-[#fff3e8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogoutIcon />

            <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
          </button>

          <div className="mt-8 px-2 text-[15px] leading-[1.5] text-[#8a95a5]">
            <p>Little pets.</p>

            <p>Brighter friendships.</p>
          </div>
        </div>
      </aside>

      {/* =========================================================
          Mobile Bottom Navigation
      ========================================================== */}

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-[72px] items-center justify-around border-t border-[#eee8e2] bg-[#fffdfb]/95 px-2 backdrop-blur-md lg:hidden">
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

        {/* Add Friend */}

        <button
          type="button"
          onClick={openAddFriendDialog}
          className="flex min-w-[75px] flex-col items-center gap-1 text-[#8a94a3]"
        >
          <div className="rounded-full px-4 py-1">
            <AddFriendIcon />
          </div>

          <span className="text-[11px] font-medium">Add Friend</span>
        </button>

        {/* Friend Requests */}

        <button
          type="button"
          onClick={openRequestsDialog}
          className="flex min-w-[75px] flex-col items-center gap-1 text-[#8a94a3]"
        >
          <div className="rounded-full px-4 py-1">
            <FriendRequestsIcon />
          </div>

          <span className="text-[11px] font-medium">Requests</span>
        </button>
      </nav>

      {/* =========================================================
          Add Friend Dialog
      ========================================================== */}

      {isAddFriendOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-[2px]"
          onMouseDown={closeAddFriendDialog}
        >
          <div
            className="w-full max-w-[420px] rounded-3xl bg-[#fffdfb] p-7 shadow-xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* Header */}

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[24px] font-semibold text-[#202733]">
                  Add a Friend
                </h2>

                <p className="mt-1 text-[14px] text-[#8a95a5]">
                  Enter username to send a friend request.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddFriendDialog}
                disabled={isSubmitting}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[20px] text-[#8a95a5] transition hover:bg-[#fff3e8] hover:text-[#202733] disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {/* Username */}

            <div className="mt-6">
              <label
                htmlFor="friend-username"
                className="mb-2 block text-[14px] font-medium text-[#4f5968]"
              >
                Username
              </label>

              <input
                id="friend-username"
                type="text"
                value={username}
                onChange={(event) => {
                  const value = event.target.value;

                  setUsername(value);
                  setMessage("");

                  const normalizedValue = value.trim().replace(/^@/, "");

                  if (!normalizedValue) {
                    setError("");
                    return;
                  }

                  if (!/^[a-zA-Z]+$/.test(normalizedValue)) {
                    setError("Username can only contain letters.");
                    return;
                  }

                  if (normalizedValue.length < 6) {
                    setError("Username must be exactly 6 characters.");
                    return;
                  }

                  if (normalizedValue.length > 6) {
                    setError("Username must be exactly 6 characters.");
                    return;
                  }

                  setError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleAddFriend();
                  }
                }}
                placeholder="Enter username"
                autoFocus
                disabled={isSubmitting}
                className="w-full rounded-2xl border border-[#e7e1dc] bg-white px-4 py-3 text-[16px] text-[#202733] outline-none transition placeholder:text-[#a2aab5] focus:border-[#d8c5b6] focus:ring-2 focus:ring-[#fff0e3] disabled:bg-[#f7f4f1]"
              />
            </div>

            {/* Success */}

            {message && (
              <p className="mt-3 text-[14px] text-green-600">{message}</p>
            )}

            {/* Error */}

            {error && <p className="mt-3 text-[14px] text-red-500">{error}</p>}

            {/* Actions */}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeAddFriendDialog}
                disabled={isSubmitting}
                className="rounded-full px-5 py-2.5 text-[14px] font-medium text-[#596373] transition hover:bg-[#f7f3ef] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAddFriend}
                disabled={isSubmitting || !isUsernameValid}
                className="rounded-full bg-[#202733] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#303846] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          Friend Requests Dialog
      ========================================================== */}

      {isRequestsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-[2px]"
          onMouseDown={closeRequestsDialog}
        >
          <div
            className="w-full max-w-[480px] rounded-3xl bg-[#fffdfb] p-7 shadow-xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* Header */}

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[24px] font-semibold text-[#202733]">
                  Friend Requests
                </h2>

                <p className="mt-1 text-[14px] text-[#8a95a5]">
                  People who want to connect with you.
                </p>
              </div>

              <button
                type="button"
                onClick={closeRequestsDialog}
                disabled={processingRequestId !== null}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[20px] text-[#8a95a5] transition hover:bg-[#fff3e8] hover:text-[#202733] disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {/* Loading */}

            {isLoadingRequests && (
              <div className="py-10 text-center text-[14px] text-[#8a95a5]">
                Loading requests...
              </div>
            )}

            {/* Error */}

            {!isLoadingRequests && requestError && (
              <div className="mt-6 rounded-2xl bg-[#fff3f0] px-4 py-3 text-[14px] text-red-500">
                {requestError}
              </div>
            )}

            {/* Empty */}

            {!isLoadingRequests && !requestError && requests.length === 0 && (
              <div className="py-10 text-center">
                <div className="text-[36px]">🐾</div>

                <p className="mt-3 text-[15px] font-medium text-[#4f5968]">
                  No friend requests
                </p>

                <p className="mt-1 text-[13px] text-[#9aa3af]">
                  You're all caught up!
                </p>
              </div>
            )}

            {/* Requests */}

            {!isLoadingRequests && requests.length > 0 && (
              <div className="mt-6 max-h-[360px] space-y-3 overflow-y-auto">
                {requests.map((request) => {
                  const isProcessing = processingRequestId === request.id;

                  return (
                    <div
                      key={request.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-[#eee8e2] bg-white px-4 py-4"
                    >
                      <div className="min-w-0">
                        <p className="text-[15px] font-medium text-[#202733]">
                          Friend request
                        </p>

                        <p className="mt-1 truncate text-[13px] text-[#8a95a5]">
                          User ID: {request.requester_id}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() =>
                            handleRequestAction(request.id, "rejected")
                          }
                          className="rounded-full border border-[#e7e1dc] px-3 py-2 text-[12px] font-medium text-[#596373] transition hover:bg-[#f7f3ef] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reject
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() =>
                            handleRequestAction(request.id, "accepted")
                          }
                          className="rounded-full bg-[#202733] px-3 py-2 text-[12px] font-medium text-white transition hover:bg-[#303846] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isProcessing ? "..." : "Accept"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Close */}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeRequestsDialog}
                disabled={processingRequestId !== null}
                className="rounded-full px-5 py-2.5 text-[14px] font-medium text-[#596373] transition hover:bg-[#f7f3ef] disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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

      <span>{label}</span>
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
      className={`flex min-w-[65px] flex-col items-center gap-1 ${
        active ? "text-[#202733]" : "text-[#8a94a3]"
      }`}
    >
      <div className={`rounded-full px-4 py-1 ${active ? "bg-[#fff0e3]" : ""}`}>
        {icon}
      </div>

      <span className="text-[11px] font-medium">{label}</span>
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

      <circle cx="9" cy="12" r=".7" fill="currentColor" />

      <circle cx="12" cy="12" r=".7" fill="currentColor" />

      <circle cx="15" cy="12" r=".7" fill="currentColor" />
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
      <rect x="4" y="7" width="16" height="12" rx="4" />

      <path d="M12 4v3" />

      <circle cx="12" cy="3" r="1" />

      <circle cx="9" cy="12" r="1" fill="currentColor" />

      <circle cx="15" cy="12" r="1" fill="currentColor" />

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
      <circle cx="12" cy="7" r="3.5" />

      <path d="M4.5 20c.8-3.5 3.4-5.5 7.5-5.5s6.7 2 7.5 5.5" />
    </svg>
  );
}

function AddFriendIcon() {
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
      <circle cx="9" cy="8" r="3" />

      <path d="M3.5 20c.7-3.4 2.7-5 5.5-5s4.8 1.6 5.5 5" />

      <path d="M18 8v6" />

      <path d="M15 11h6" />
    </svg>
  );
}

function FriendRequestsIcon() {
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
      <circle cx="8" cy="8" r="3" />

      <path d="M2.5 20c.7-3.5 2.7-5.2 5.5-5.2s4.8 1.7 5.5 5.2" />

      <path d="M16 8l2 2 4-4" />

      <path d="M16 14h5" />

      <path d="M16 17h4" />
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
