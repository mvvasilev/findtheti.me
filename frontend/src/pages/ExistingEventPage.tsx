import { useParams } from "react-router-dom";

export default function ExistingEventPage() {
    let { pasteId } = useParams();

    console.log(pasteId);

    return (
        <div />
    );
}