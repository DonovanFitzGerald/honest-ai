import type { UseLog, UseCase } from '@/types/assistant';

const UseLogDisplay = ({ useLog }: { useLog: UseLog }) => {
    if (!useLog) return;
    return (
        <div className="mx-auto flex max-w-2xl flex-1 flex-col gap-6 p-6">
            <div className="border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">AI Use</h2>
                <p className="mt-2 font-medium text-gray-600">
                    Total Use Cases: {useLog.total_use_cases}
                </p>
                <p className="mt-2 text-gray-700 italic">
                    "{useLog.summary_statement}"
                </p>
            </div>

            <div className="flex flex-col gap-8">
                {useLog.use_cases.map((useCase, index: number) => (
                    <UseCaseCard key={index} useCase={useCase} />
                ))}
            </div>
        </div>
    );
};

const UseCaseCard = ({ useCase }: { useCase: UseCase }) => {
    return (
        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">{useCase.label}</h3>
            <div className="space-y-1 text-sm text-gray-700">
                <p>
                    <span className="font-bold">Evidence:</span>{' '}
                    {useCase.evidence}
                </p>
                <p>
                    <span className="font-bold">Role:</span>{' '}
                    {useCase.assistant_role}
                </p>
                <p>
                    <span className="font-bold">Confidence:</span>{' '}
                    {useCase.confidence}
                </p>
                <div className="flex gap-4 pt-2">
                    <span className="rounded text-xs font-semibold uppercase">
                        Input: {useCase.input_type.join(', ')}
                    </span>
                    <span className="rounded text-xs font-semibold uppercase">
                        Output: {useCase.output_type.join(', ')}
                    </span>
                </div>
            </div>
        </div>
    );
};

export { UseLogDisplay, UseCaseCard };
