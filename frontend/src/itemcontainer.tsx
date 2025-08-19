import { type ItemData } from "./sendCodeHandler"


const ItemContainer = ({ item }: { item: ItemData | null }) => {

    return(
        <div>
            <header>
            {item?.name}
            </header>
            <img src="" alt="" />
        </div>
    )


}

export default ItemContainer;
