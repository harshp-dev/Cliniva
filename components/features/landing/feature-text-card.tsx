import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/common/card";

type FeatureTextCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export function FeatureTextCard({ icon, title, description }: FeatureTextCardProps) {
  return (
    <Card className="reveal-text shadow-md">
      <CardHeader>
        <div className="mb-3">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-[#222222]/80">{description}</p>
      </CardContent>
    </Card>
  );
}
