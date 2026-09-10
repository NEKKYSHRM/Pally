"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="flex h-[64px] w-full items-center justify-center gap-4 rounded-full border border-[#dedfe4] bg-white px-5 text-[18px] font-medium text-[#202733] shadow-[0_4px_14px_rgba(32,39,51,0.06)] transition hover:bg-[#fafafa] hover:shadow-[0_6px_18px_rgba(32,39,51,0.09)] active:scale-[0.99] sm:h-[70px] sm:text-[20px]"
    >
      {/* Google G */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          fill="#4285F4"
          d="M21.35 12.27c0-.71-.06-1.39-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.22Z"
        />
        <path
          fill="#34A853"
          d="M12 21.82c2.63 0 4.84-.87 6.45-2.33l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.53A9.74 9.74 0 0 0 12 21.82Z"
        />
        <path
          fill="#FBBC05"
          d="M6.54 13.93a5.86 5.86 0 0 1 0-3.86V7.54H3.29a9.83 9.83 0 0 0 0 8.92l3.25-2.53Z"
        />
        <path
          fill="#EA4335"
          d="M12 6.04c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.84 3.16 14.63 2.18 12 2.18a9.74 9.74 0 0 0-8.71 5.36l3.25 2.53C7.31 7.76 9.46 6.04 12 6.04Z"
        />
      </svg>

      <span>Continue with Google</span>
    </button>
  );
}