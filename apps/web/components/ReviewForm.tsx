"use client";
import { useActionState, useState } from "react";
import { submitReview } from "@/app/product/[slug]/actions";

export function ReviewForm({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState(submitReview, undefined);
  const [rating, setRating] = useState(0);

  if (state?.ok) {
    return <p className="bg-emerald/10 p-4 text-sm text-emerald">Thank you! Your review will appear after we approve it.</p>;
  }
  return (
    <form action={action} className="space-y-4 bg-white p-6">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating} />
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <h3 className="text-2xl">Write a review</h3>
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}
            className={`text-3xl leading-none ${n <= rating ? "text-gold" : "text-ink/20"}`}>★</button>
        ))}
      </div>
      <div><label className="label">Your name</label><input name="name" required className="input" /></div>
      <div><label className="label">Your review</label><textarea name="comment" required rows={3} className="input" /></div>
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      <button disabled={pending} className="btn-primary">{pending ? "Sending…" : "Submit review"}</button>
    </form>
  );
}
