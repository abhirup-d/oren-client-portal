"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Bell, Mail, MessageSquare, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Organization, Project, AdminUser } from "@/lib/supabase/types";

interface OnboardingWizardProps {
  org: Organization;
  userName: string;
  projects: Project[];
  assignedPm: AdminUser | null;
}

type Step = "welcome" | "pm" | "projects" | "notifications" | "done";

const STEPS: Step[] = ["welcome", "pm", "projects", "notifications", "done"];

export function OnboardingWizard({ org, userName, projects, assignedPm }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [notifPrefs, setNotifPrefs] = useState({
    in_app: true,
    email: true,
    whatsapp: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = step === "done";
  const firstName = userName.split(" ")[0];

  function togglePref(key: keyof typeof notifPrefs) {
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleComplete() {
    setSaving(true);
    setError(null);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Session expired. Please log in again.");
      setSaving(false);
      return;
    }

    // Save notification prefs
    const { error: userError } = await supabase
      .from("users")
      .update({ notification_prefs: notifPrefs })
      .eq("id", user.id);

    if (userError) {
      setError("Failed to save preferences. Please try again.");
      setSaving(false);
      return;
    }

    // Mark org onboarding as complete
    const { error: orgError } = await supabase
      .from("organizations")
      .update({ onboarding_completed: true })
      .eq("id", org.id);

    if (orgError) {
      setError("Failed to complete onboarding. Please try again.");
      setSaving(false);
      return;
    }

    router.push("/dashboard");
  }

  function next() {
    if (step === "done") {
      handleComplete();
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  }

  function back() {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                i === currentStep
                  ? "w-6 bg-primary"
                  : i < currentStep
                  ? "w-2 bg-primary/50"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="rounded-xl border border-border bg-card p-8 space-y-6">
          {step === "welcome" && (
            <div className="text-center space-y-4">
              <div className="text-4xl">👋</div>
              <h1 className="text-2xl font-bold text-foreground">Welcome, {firstName}!</h1>
              <p className="text-muted-foreground">
                Welcome to the <strong>{org.name}</strong> portal, powered by Oren (Maroon Oak Technologies).
                We're delighted to have you here.
              </p>
              <p className="text-sm text-muted-foreground">
                This short setup will take just a minute. We'll show you your project manager,
                your active projects, and let you choose how you'd like to be notified.
              </p>
            </div>
          )}

          {step === "pm" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Your Project Manager</h2>
              {assignedPm ? (
                <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xl">
                    {assignedPm.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{assignedPm.name}</p>
                    <p className="text-sm text-muted-foreground">{assignedPm.email}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">{assignedPm.role}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    A project manager will be assigned to you shortly. You'll receive a notification once that's done.
                  </p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Your PM is your primary point of contact for all project updates, questions, and deliverables.
              </p>
            </div>
          )}

          {step === "projects" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Your Projects</h2>
              {projects.length === 0 ? (
                <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    No projects have been set up yet. Your Oren team will create them shortly.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {projects.map((project) => (
                    <li
                      key={project.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                    >
                      <div>
                        <p className="font-medium text-foreground text-sm">{project.title}</p>
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">
                          {project.type.replace("_", " ")} &mdash; {project.status}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          project.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {project.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {step === "notifications" && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-foreground">Notification Preferences</h2>
              <p className="text-sm text-muted-foreground">
                Choose how you'd like to receive updates about your projects.
              </p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={notifPrefs.in_app}
                    onChange={() => togglePref("in_app")}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  <Bell className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">In-app notifications</p>
                    <p className="text-xs text-muted-foreground">See updates inside the portal</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={notifPrefs.email}
                    onChange={() => togglePref("email")}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  <Mail className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Email notifications</p>
                    <p className="text-xs text-muted-foreground">Receive updates and digests by email</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={notifPrefs.whatsapp}
                    onChange={() => togglePref("whatsapp")}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  <MessageSquare className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">WhatsApp notifications</p>
                    <p className="text-xs text-muted-foreground">Get urgent alerts via WhatsApp</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">You're all set!</h2>
              <p className="text-muted-foreground">
                Your portal is ready. Head to your dashboard to see your projects, documents,
                and updates in one place.
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={back}
            disabled={isFirst || saving}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {error && <p className="text-sm text-destructive text-center">{error}</p>}

          <Button
            onClick={next}
            disabled={saving}
            className="flex items-center gap-1"
          >
            {step === "done" ? (
              saving ? "Setting up..." : "Go to Dashboard"
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
