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
}

// Order matters: the first match wins, so "oil filter" is classified as an oil
// change rather than a filter change.
export const SERVICE_TYPE_PRESETS: ServiceTypePreset[] = [
	{ key: "oil", label: "Oil change", icon: IconDroplet, match: /oil/ },
	{ key: "filters", label: "Filters", icon: IconFilter, match: /filter/ },
	{ key: "brakes", label: "Brakes", icon: IconDisc, match: /brake|disc|pad/ },
	{
		key: "tyres",
		label: "Tyres",
		icon: IconWheel,
		match: /tyre|tire|wheel|align|balanc/,
	},
	{ key: "battery", label: "Battery", icon: IconBattery, match: /batter/ },
	{
		key: "inspection",
		label: "Inspection",
		icon: IconClipboardCheck,
		match: /inspect|registrat|technical/,
	},
	{
		key: "timing-belt",
		label: "Timing belt",
		icon: IconEngine,
		match: /timing|belt|chain|engine/,
	},
	{
		key: "transmission",
		label: "Transmission",
		icon: IconManualGearbox,
		match: /transmission|gearbox|clutch/,
	},
	{
		key: "suspension",
		label: "Suspension",
		icon: IconArrowsUpDown,
		match: /suspension|shock|strut|spring/,
	},
	{
		key: "air-conditioning",
		label: "Air conditioning",
		icon: IconAirConditioning,
		match: /air.?con|a\/c|climate/,
	},
	{
		key: "coolant",
		label: "Coolant",
		icon: IconTemperature,
		match: /coolant|radiator|thermostat|antifreeze/,
	},
	{ key: "lights", label: "Lights", icon: IconBulb, match: /light|bulb|lamp/ },
	{
		key: "bodywork",
		label: "Bodywork",
		icon: IconCarCrash,
		match: /body|paint|dent|bumper/,
	},
	{
		key: "cleaning",
		label: "Cleaning",
		icon: IconWash,
		match: /clean|wash|detail/,
	},
];

/** The preset a free-text service type belongs to, or null if none matches. */
export function getServiceTypePreset(
	serviceType: string
): ServiceTypePreset | null {
	const text = serviceType.toLowerCase();
	return SERVICE_TYPE_PRESETS.find((preset) => preset.match.test(text)) ?? null;
}

/** Falls back to a generic tool, so every record gets an icon. */
export function getServiceTypeIcon(serviceType: string): IconComponent {
	return getServiceTypePreset(serviceType)?.icon ?? IconTool;
}
