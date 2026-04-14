import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export type ChatOptionSelectOption = {
    label: string;
    value: string;
};

export default function ChatOptionSelect({
    disabled,
    itemClassName,
    onValueChange,
    options,
    placeholder,
    triggerClassName,
    value,
}: {
    disabled: boolean;
    itemClassName?: string;
    onValueChange: (value: string) => void;
    options: ChatOptionSelectOption[];
    placeholder: string;
    triggerClassName?: string;
    value?: string;
}) {
    return (
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
            <SelectTrigger
                className={
                    triggerClassName ??
                    'h-full w-fit min-w-32 cursor-pointer flex-nowrap truncate rounded-2xl bg-background'
                }
            >
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem
                        key={option.value}
                        value={option.value}
                        className={itemClassName ?? 'cursor-pointer'}
                    >
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
