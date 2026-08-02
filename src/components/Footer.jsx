import React from 'react';

export default function Footer() {
  return (
    <footer class="py-8 border-t border-white/10 flex flex-col items-center justify-center gap-4 w-full text-center">
      <span class="font-headline-xl text-[28px] text-primary font-bold tracking-tight">FlickBot</span>
      <div class="flex flex-wrap justify-center gap-6">
        <a class="text-on-surface-variant/70 font-label-sm text-label-sm hover:text-primary transition-colors" href="#">Privacy Policy</a>
        <a class="text-on-surface-variant/70 font-label-sm text-label-sm hover:text-primary transition-colors" href="#">Terms of Service</a>
        <a class="text-on-surface-variant/70 font-label-sm text-label-sm hover:text-primary transition-colors" href="#">Help Center</a>
        <a class="text-on-surface-variant/70 font-label-sm text-label-sm hover:text-primary transition-colors" href="#">TMDb API</a>
      </div>
      <p class="text-on-surface-variant/50 text-[11px] uppercase tracking-widest mt-2">© 2024 FlickBot Cinema Studio. All rights reserved.</p>
    </footer>
  );
}
