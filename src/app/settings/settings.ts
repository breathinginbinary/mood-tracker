import { Component, computed, signal } from '@angular/core';

export type Condition = 'bipolar' | 'adhd' | 'anxiety' | 'depression' | 'schizophrenia';
export type InputType = 'slider' | 'radio' | 'checkbox';

export interface Symptom {
  id: string;
  label: string;
  condition: Condition;
  input: InputType;
  /** Choices for `radio` symptoms. */
  options?: string[];
}

type Item = Omit<Symptom, 'id' | 'condition'>;

const STORAGE_KEY = 'mood-tracker.settings';

/** 0-10 rating. */
const slider = (label: string): Item => ({ label, input: 'slider' });
/** Tick if it happened today. */
const check = (label: string): Item => ({ label, input: 'checkbox' });
/** Pick one option. */
const radio = (label: string, options: string[]): Item => ({ label, input: 'radio', options });

const FREQUENCY = ['Not at all', 'Sometimes', 'Often', 'Very often'];
const SEVERITY = ['None', 'Mild', 'Moderate', 'Severe'];

const ADHD_SYMPTOMS: Item[] = [
  slider('Difficulty sustaining focus on a task'),
  slider('Easily distracted by noises or things around me'),
  slider('Mind wandering during conversations or meetings'),
  radio('Zoned out when someone was talking to me', FREQUENCY),
  radio('Careless mistakes or missed details', SEVERITY),
  slider('Trouble finishing things I started'),
  slider('Avoided tasks that need sustained mental effort'),
  check('Lost or misplaced something important'),
  check('Forgot an appointment, task, or commitment'),
  slider('Brain fog / mentally cloudy'),
  radio('Hyperfocus (lost track of time on one thing)', [
    'None',
    'Productive',
    'Unproductive',
    'Both',
  ]),
  slider('Trouble getting started on tasks'),
  slider('Procrastination'),
  slider('Trouble prioritizing what to do first'),
  slider('Difficulty planning or organizing'),
  slider('Felt overwhelmed by the number of things to do'),
  slider('Trouble switching from one task to another'),
  radio('Forgot what I was about to do mid-task', ['0 times', '1-2 times', '3-5 times', '6+ times']),
  check('Trouble following multi-step instructions'),
  radio('Lost track of time / ran late', ['On time', 'A little late', 'Very late', 'Missed it']),
  slider('Inner restlessness'),
  slider('Racing or jumping thoughts'),
  slider('Fidgeting or tapping'),
  check('Hard to sit still when I needed to'),
  slider('Difficulty relaxing or winding down'),
  slider('Felt driven by a motor'),
  radio('Talked more than I intended', FREQUENCY),
  slider('Acted without thinking it through'),
  check('Interrupted or blurted something out'),
  slider('Trouble waiting my turn / waiting in line'),
  check('Impulse purchase'),
  check('Impulsive eating or snacking'),
  slider('Urge to drop what I was doing for something new'),
  radio('Lost time to scrolling or screens', ['None', 'Under 1 hr', '1-3 hrs', '3+ hrs']),
  slider('Irritability'),
  slider('Quick to feel frustrated'),
  radio('Mood swings', SEVERITY),
  slider('Emotionally overwhelmed'),
  slider('Sensitive to criticism or feeling rejected'),
  check('Anger outburst or lost my temper'),
  slider('Anxiety or worry'),
  slider('Boredom'),
  slider('Self-critical or guilty about unfinished tasks'),
];

const BIPOLAR_SYMPTOMS: Item[] = [
  slider('Unusually happy, high, or euphoric'),
  slider('Felt unusually confident, powerful, or special'),
  slider('Much more energy than usual'),
  slider('Pushed hard on goals or projects (far more than usual)'),
  check('Started several new projects or plans today'),
  slider('Unusually creative or inspired'),
  slider("Felt driven; couldn't slow down"),
  slider('Racing thoughts'),
  slider('Jumped quickly from idea to idea'),
  radio('Talked faster or more than usual', FREQUENCY),
  slider('Easily pulled off track by unimportant things'),
  slider('Trouble concentrating'),
  slider('Brain fog or slowed thinking'),
  slider('Trouble making decisions'),
  check('Others had trouble following what I was saying'),
  check('Needed much less sleep than usual but still felt energized'),
  check('Trouble falling or staying asleep'),
  check('Slept much more than usual, or hard to get out of bed'),
  slider('Acted without thinking about consequences'),
  check('Impulsive or excessive spending'),
  check('Risky or reckless behavior'),
  slider('Increased sexual interest or activity'),
  slider('Low, sad, or empty mood'),
  slider('Lost interest or pleasure in things I usually enjoy'),
  slider('Felt hopeless about the future'),
  slider('Felt worthless or excessively guilty'),
  check('Crying spells or tearfulness'),
  slider('Moved or spoke more slowly than usual'),
  slider('Withdrew from people or activities'),
  slider('Low motivation; hard to get started'),
  slider('Irritable or short-tempered'),
  slider('Physically agitated or unable to sit still'),
  radio('Mood swings during the day', FREQUENCY),
  slider('Wired but tired: high energy and low mood at the same time'),
  check('Unusual beliefs or experiences'),
  check("Others said I seemed 'off' or unlike myself"),
  slider('Fatigue or loss of energy'),
];

const ANXIETY_SYMPTOMS: Item[] = [
  slider('Excessive worry'),
  slider('Felt nervous, anxious, or on edge'),
  slider('Couldn\'t stop or control worrying'),
  slider('Muscle tension'),
  slider('Felt keyed up or restless'),
  slider('Racing heart or chest tightness'),
  slider('Shortness of breath or tight throat'),
  slider('Dread or sense that something bad would happen'),
  slider('Avoided situations because of anxiety'),
  slider('Social anxiety or self-consciousness'),
  check('Panic attack'),
  check('Trouble falling or staying asleep because of worry'),
  radio('Anxiety interfered with daily activities', SEVERITY),
];

const DEPRESSION_SYMPTOMS: Item[] = [
  slider('Low, sad, or empty mood'),
  slider('Lost interest or pleasure in things I usually enjoy'),
  slider('Felt hopeless about the future'),
  slider('Felt worthless or excessively guilty'),
  slider('Fatigue or loss of energy'),
  slider('Trouble concentrating or making decisions'),
  slider('Low motivation; hard to get started'),
  slider('Withdrew from people or activities'),
  check('Crying spells or tearfulness'),
  check('Slept much more than usual, or hard to get out of bed'),
  check('Trouble falling or staying asleep'),
  radio('Appetite change', ['None', 'Eating less', 'Eating more']),
  radio('Moved or spoke more slowly than usual', FREQUENCY),
];

const SCHIZOPHRENIA_SYMPTOMS: Item[] = [
  check('Heard voices or sounds others did not'),
  check('Saw things others did not'),
  slider('Felt suspicious or paranoid'),
  slider('Felt that people were watching or talking about me'),
  slider('Unusual or fixed beliefs'),
  slider('Disorganized or confused thinking'),
  slider('Trouble following a conversation'),
  check('Speech was hard for others to follow'),
  slider('Flat or reduced emotions'),
  slider('Low motivation or loss of drive'),
  slider('Withdrew from people'),
  slider('Trouble with self-care or daily routines'),
  slider('Trouble concentrating or remembering'),
  radio('Felt disconnected from myself or my surroundings', FREQUENCY),
];

function build(items: Item[], condition: Condition): Symptom[] {
  return items.map((item) => ({ ...item, id: `${condition}:${item.label}`, condition }));
}

/** Every condition the user can enable, in display order. */
export const CONDITIONS: { id: Condition; title: string }[] = [
  { id: 'bipolar', title: 'Bipolar' },
  { id: 'adhd', title: 'ADHD' },
  { id: 'anxiety', title: 'Anxiety' },
  { id: 'depression', title: 'Depression' },
  { id: 'schizophrenia', title: 'Schizophrenia' },
];

const ALL_SYMPTOMS: Symptom[] = [
  ...build(BIPOLAR_SYMPTOMS, 'bipolar'),
  ...build(ADHD_SYMPTOMS, 'adhd'),
  ...build(ANXIETY_SYMPTOMS, 'anxiety'),
  ...build(DEPRESSION_SYMPTOMS, 'depression'),
  ...build(SCHIZOPHRENIA_SYMPTOMS, 'schizophrenia'),
];

type Enabled = Record<Condition, boolean>;

interface Saved {
  enabled: Enabled;
  selected: string[];
}

function load(): Saved {
  const enabled = Object.fromEntries(CONDITIONS.map((c) => [c.id, false])) as Enabled;
  let selected: string[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      // Conditions are stored as top-level booleans (`bipolar: true`).
      const parsed = JSON.parse(raw) as Partial<Record<Condition, unknown>> & {
        selected?: unknown;
      };
      for (const { id } of CONDITIONS) enabled[id] = !!parsed[id];
      if (Array.isArray(parsed.selected)) selected = parsed.selected;
    }
  } catch {
    // ignore corrupt or unavailable storage
  }
  return { enabled, selected };
}

export function findSymptom(id: string): Symptom | undefined {
  return ALL_SYMPTOMS.find((s) => s.id === id);
}

/** The symptoms the user chose on the settings page, in the order they were added. */
export function loadSelectedSymptoms(): Symptom[] {
  return load()
    .selected.map((id) => ALL_SYMPTOMS.find((s) => s.id === id))
    .filter((s): s is Symptom => !!s);
}

@Component({
  imports: [],
  selector: 'app-settings',
  styleUrl: './settings.css',
  templateUrl: './settings.html',
})
export class Settings {
  private readonly initial = load();

  protected readonly conditions = CONDITIONS;
  protected readonly enabled = signal<Enabled>(this.initial.enabled);
  private readonly selectedIds = signal<string[]>(this.initial.selected);

  protected readonly anyEnabled = computed(() => Object.values(this.enabled()).some(Boolean));

  /** Unselected symptoms of each enabled condition, for the dropdown. */
  protected readonly available = computed(() =>
    CONDITIONS.filter((c) => this.enabled()[c.id])
      .map((c) => ({
        ...c,
        symptoms: ALL_SYMPTOMS.filter(
          (s) => s.condition === c.id && !this.selectedIds().includes(s.id),
        ),
      }))
      .filter((g) => g.symptoms.length > 0),
  );

  protected readonly chosen = computed(() =>
    this.selectedIds()
      .map((id) => ALL_SYMPTOMS.find((s) => s.id === id))
      .filter((s): s is Symptom => !!s),
  );

  protected conditionTitle(id: Condition): string {
    return CONDITIONS.find((c) => c.id === id)!.title;
  }

  protected setCondition(condition: Condition, checked: boolean): void {
    this.enabled.update((e) => ({ ...e, [condition]: checked }));
    this.persist();
  }

  protected add(select: HTMLSelectElement): void {
    const id = select.value;
    if (id && !this.selectedIds().includes(id)) {
      this.selectedIds.update((ids) => [...ids, id]);
      this.persist();
    }
    select.value = '';
  }

  protected addAll(): void {
    const ids = this.available().flatMap((g) => g.symptoms.map((s) => s.id));
    if (ids.length) {
      this.selectedIds.update((current) => [...current, ...ids]);
      this.persist();
    }
  }

  protected removeAll(): void {
    this.selectedIds.set([]);
    this.persist();
  }

  protected remove(id: string): void {
    this.selectedIds.update((ids) => ids.filter((i) => i !== id));
    this.persist();
  }

  private persist(): void {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...this.enabled(), selected: this.selectedIds() }),
      );
    } catch {
      // storage unavailable; keep in-memory state only
    }
  }
}
