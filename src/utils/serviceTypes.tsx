import {
	IconAirConditioning,
	IconArrowsUpDown,
	IconBattery,
	IconBulb,
	IconCarCrash,
	IconClipboardCheck,
	IconDisc,
	IconDroplet,
	IconEngine,
	IconFilter,
	IconManualGearbox,
	IconTemperature,
	IconTool,
	IconWash,
	IconWheel,
} from "@tabler/icons-react";

type IconComponent = typeof IconTool;

export interface ServiceTypePreset {
	key: string;
	label: string;
	icon: IconComponent;
	/**
	 * Classifies the free text already in Firestore. `serviceType` has always
	 * been an unconstrained string, so existing records will not match a preset
	 * label exactly - matching on keywords avoids any migration.
	 */
	match: RegExp;
	/**
	 * How long this service typically lasts, used to pre-fill the next service
	 * date in the form. Omitted for one-off jobs like bodywork that are not on
	 * any schedule. A date the user types always wins over this suggestion.
	 */
	intervalMonths?: number;
}

// Order matters: the first match wins, so "oil filter" is classified as an oil
// change rather than a filter change.
export const SERVICE_TYPE_PRESETS: ServiceTypePreset[] = [
	{
		key: "oil",
		label: "Oil change",
		icon: IconDroplet,
		match: /\b(?:oil)/,
		intervalMonths: 12,
	},
	{
		key: "filters",
		label: "Filters",
		icon: IconFilter,
		match: /\b(?:filter)/,
		intervalMonths: 12,
	},
	{
		key: "brakes",
		label: "Brakes",
		icon: IconDisc,
		match: /\b(?:brake|disc|pad)/,
		intervalMonths: 24,
	},
	{
		key: "tyres",
		label: "Tyres",
		icon: IconWheel,
		match: /\b(?:tyre|tire|wheel|align|balanc)/,
		intervalMonths: 24,
	},
	{
		key: "battery",
		label: "Battery",
		icon: IconBattery,
		match: /\b(?:batter)/,
		intervalMonths: 48,
	},
	{
		key: "inspection",
		label: "Inspection",
		icon: IconClipboardCheck,
		match: /\b(?:inspect|registrat|technical)/,
		intervalMonths: 12,
	},
	{
		key: "timing-belt",
		label: "Timing belt",
		icon: IconEngine,
		match: /\b(?:timing|belt|chain|engine)/,
		intervalMonths: 60,
	},
	{
		key: "transmission",
		label: "Transmission",
		icon: IconManualGearbox,
		match: /\b(?:transmission|gearbox|clutch)/,
		intervalMonths: 48,
	},
	{
		key: "suspension",
		label: "Suspension",
		icon: IconArrowsUpDown,
		match: /\b(?:suspension|shock|strut|spring)/,
		intervalMonths: 48,
	},
	{
		key: "air-conditioning",
		label: "Air conditioning",
		icon: IconAirConditioning,
		match: /\b(?:air.?con|a\/c|climate)/,
		intervalMonths: 24,
	},
	{
		key: "coolant",
		label: "Coolant",
		icon: IconTemperature,
		match: /\b(?:coolant|radiator|thermostat|antifreeze)/,
		intervalMonths: 48,
	},
	{ key: "lights", label: "Lights", icon: IconBulb, match: /\b(?:light|bulb|lamp)/ },
	{
		key: "bodywork",
		label: "Bodywork",
		icon: IconCarCrash,
		match: /\b(?:body|paint|dent|bumper)/,
	},
	{
		key: "cleaning",
		label: "Cleaning",
		icon: IconWash,
		match: /\b(?:clean|wash|detail)/,
	},
];

/** The preset a free-text service type belongs to, or null if none matches. */
export function getServiceTypePreset(
	serviceType: string
): ServiceTypePreset | null {
	const text = serviceType.toLowerCase();
	return SERVICE_TYPE_PRESETS.find((preset) => preset.match.test(text)) ?? null;
}

/**
 * How many months this kind of service usually lasts, or null when it is not a
 * recurring job (bodywork, cleaning) or matches no preset at all.
 */
export function getServiceIntervalMonths(serviceType: string): number | null {
	return getServiceTypePreset(serviceType)?.intervalMonths ?? null;
}

/** Falls back to a generic tool, so every record gets an icon. */
export function getServiceTypeIcon(serviceType: string): IconComponent {
	return getServiceTypePreset(serviceType)?.icon ?? IconTool;
}
