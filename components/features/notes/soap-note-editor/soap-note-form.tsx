"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/common/button";
import { FormField } from "@/components/forms/form-field";
import { TextareaField } from "@/components/forms/textarea-field";
import {
  soapNoteSchema,
  type SoapNoteFormInput,
  type SoapNoteInput,
} from "@/lib/validations/notes";
import type { SoapNoteRecord } from "@/types/domain/notes";

type SaveSoapNoteResult = {
  status: "idle" | "success" | "error";
  message?: string;
};

type SoapNoteFormProps = {
  appointmentId: string;
  initialNote: SoapNoteRecord | null;
  onSave: (input: SoapNoteInput & { appointmentId: string }) => Promise<SaveSoapNoteResult>;
};

export function SoapNoteForm({
  appointmentId,
  initialNote,
  onSave,
}: SoapNoteFormProps) {
  const router = useRouter();
  const [result, setResult] = useState<SaveSoapNoteResult>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SoapNoteFormInput, undefined, SoapNoteInput>({
    resolver: zodResolver(soapNoteSchema),
    defaultValues: {
      subjective: initialNote?.subjective ?? "",
      objective: initialNote?.objective ?? "",
      assessment: initialNote?.assessment ?? "",
      plan: initialNote?.plan ?? "",
      isSharedWithPatient: initialNote?.isSharedWithPatient ?? false,
    },
  });

  const onSubmit = (values: SoapNoteInput) => {
    setResult({ status: "idle" });

    startTransition(async () => {
      const nextResult = await onSave({
        appointmentId,
        ...values,
      });

      setResult(nextResult);

      if (nextResult.status === "success") {
        router.refresh();
      }
    });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <FormField
        label="Subjective"
        htmlFor="subjective"
        error={errors.subjective?.message}
        hint="Capture the patient-reported symptoms, concerns, and history relevant to this visit."
      >
        <TextareaField
          id="subjective"
          placeholder="Patient-reported history, symptoms, and concerns"
          hasError={Boolean(errors.subjective)}
          {...register("subjective")}
        />
      </FormField>

      <FormField
        label="Objective"
        htmlFor="objective"
        error={errors.objective?.message}
        hint="Document observed findings, exam details, or measurable clinical information."
      >
        <TextareaField
          id="objective"
          placeholder="Observed findings, measurements, or exam details"
          hasError={Boolean(errors.objective)}
          {...register("objective")}
        />
      </FormField>

      <FormField
        label="Assessment"
        htmlFor="assessment"
        error={errors.assessment?.message}
        hint="Summarize your clinical impression and current working diagnosis."
      >
        <TextareaField
          id="assessment"
          placeholder="Clinical interpretation and assessment"
          hasError={Boolean(errors.assessment)}
          {...register("assessment")}
        />
      </FormField>

      <FormField
        label="Plan"
        htmlFor="plan"
        error={errors.plan?.message}
        hint="Include next steps, follow-up instructions, medications, or referrals."
      >
        <TextareaField
          id="plan"
          placeholder="Treatment plan, follow-up, referrals, and instructions"
          hasError={Boolean(errors.plan)}
          {...register("plan")}
        />
      </FormField>

      <label className="flex items-start gap-3 rounded-2xl border border-[#222222]/10 bg-white/55 px-4 py-4 text-sm text-[#222222]/74">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border border-[#222222]/20 accent-[#FA8112]"
          {...register("isSharedWithPatient")}
        />
        <span>
          <span className="block font-semibold text-[#222222]">Share with patient</span>
          <span className="mt-1 block">
            When enabled, this SOAP note becomes visible inside the patient records portal.
          </span>
        </span>
      </label>

      {result.status === "error" ? (
        <p className="rounded-xl border border-[#B42318]/25 bg-[#FDECEC] px-4 py-3 text-sm text-[#B42318]">
          {result.message ?? "Unable to save the SOAP note."}
        </p>
      ) : null}

      {result.status === "success" ? (
        <p className="rounded-xl border border-emerald-600/20 bg-emerald-600/10 px-4 py-3 text-sm text-emerald-800">
          {result.message ?? "SOAP note saved."}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSubmitting || isPending}>
          {isSubmitting || isPending ? "Saving note..." : initialNote ? "Update SOAP note" : "Save SOAP note"}
        </Button>
        <Button href={`/consultations/${appointmentId}`} variant="secondary">
          Back to consultation
        </Button>
      </div>
    </form>
  );
}
