const renderUser=(params)=>{
    return `<div>${params.name}</div> 
    <div>${params.blood}🩸</div> 
    <div>
        ${params.cards.map((card)=>`<span>${card}</span>`)}
    </div><br/><br/><br/>`
}