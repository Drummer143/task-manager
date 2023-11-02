import Calendar from "@/components/Calendar";

interface Props {
    params: {
        lang: I18NLocale;
    }
}

export default function Home({ params }: Props) {
    return <Calendar params={params} />;
}
