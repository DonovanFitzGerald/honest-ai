import { MoveRight } from 'lucide-react';
import type { UseLog, UseLogCase } from '@/types/assistant';

const UseLogDisplay = ({ useLog }: { useLog: UseLog }) => {
    if (!useLog) return;
    return (
        <div className="mx-auto flex max-w-2xl flex-1 flex-col gap-6">
            <div className="">
                <p className="mt-2 font-medium">
                    Use Cases: {useLog.total_use_cases}
                </p>
                <p className="mt-2 text-gray-400">{useLog.summary_statement}</p>
            </div>

            <div className="flex flex-col gap-8">
                {useLog.use_cases &&
                    useLog.use_cases.length > 0 &&
                    useLog.use_cases.map((useCase, index: number) => (
                        <UseCaseCard
                            key={index}
                            useCase={useCase}
                            index={index}
                        />
                    ))}
            </div>
        </div>
    );
};

const UseCaseCard = ({
    useCase,
    index,
}: {
    useCase: UseLogCase;
    index: number;
}) => {
    return (
        <div className="rounded-lg bg-accent p-4 shadow-sm">
            <div className="flex justify-between">
                <h3 className="mb-2 text-lg font-semibold">{useCase.label}</h3>
                <h3 className="text-neutral-400">{index + 1}</h3>
            </div>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p>{useCase.evidence}</p>
                <p className="text-neutral-400">
                    <span className="font-medium">Assistant Role:</span>
                    {useCase.assistant_role}
                </p>
                <div className="grid grid-cols-3 pt-2 text-xs text-muted-foreground uppercase">
                    <div>
                        {useCase.input_type.map((t, i) => {
                            return (
                                <p key={`${index}-in-${i}`}>
                                    {t}
                                    {i + 1 !== useCase.output_type.length
                                        ? ','
                                        : ''}
                                </p>
                            );
                        })}
                    </div>
                    <MoveRight className="mx-auto h-4" />
                    <div>
                        {useCase.output_type.map((t, i) => {
                            return (
                                <p key={`${index}-out-${i}`}>
                                    {t}
                                    {i + 1 !== useCase.output_type.length
                                        ? ','
                                        : ''}
                                </p>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export { UseLogDisplay, UseCaseCard };
