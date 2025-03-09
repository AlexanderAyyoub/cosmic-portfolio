

export default async function projectStars(){
    try{
        const starResponse = await getAllStars();
        console.log(starResponse);
        const { star } = await starResponse.json();
        
        if(!star || star.length < 0 || star.length === 0){
            return;
        }

       
    } catch (error) {
        console.error("Error fetching or adding stars:", error);
    }
    
    
}