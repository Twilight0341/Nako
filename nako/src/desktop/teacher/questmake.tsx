import React from "react";
import styles from "./questmake.module.scss";
import { Link } from "react-router-dom";

interface State {
    input: string,
}

class Quest extends React.Component<{}, State>{
    constructor(props: any) {
        super(props);
        this.state = {
            input: "hello",
        };
    }


    render() {
        return (
            <div className={styles["flex-container"]}>
                <div>
                    <div id={styles["yellow-topbar"]}>
                        <p id={styles.add}>Add Game</p>

                    </div>
                    <div id={styles["yellow-wrapper"]}>
                        <div id={styles["input-container"]}>
                            <div>
                                <span>Bank Title :</span>
                                <input type="text" name="fname" onChange={(e) => this.setState({ input: e.target.value })} /> 
                            </div>
                            <div>
                                <span>Category :</span>
                                <p className={styles["cateone-wrapper"]}>Year</p>
                                <p className={styles["cateone-wrapper"]}>Math</p>
                            </div>
                            {/* <div className={styles["input-container"]}> */}
                            <div>
                                <span>Add group :</span>
                                <p className={styles["catetwo-wrapper"]}>Class 3D</p>
                                <p className={styles["catetwo-wrapper"]}>Class 3C</p>
                            </div>
                            {/* <div className={styles["input-container"]}> */}
                            <div>
                                <span>Date :</span>
                                <p className={styles["catethree-wrapper"]}>2021年1月3日</p>
                                <p className={styles["to-wrapper"]}>To</p>
                                <p className={styles["catethree-wrapper"]}>2021年1月3日</p>
                            </div>
                            {/* <div className={styles["input-container"]}> */}
                            <div>
                                <span>Time :</span>
                                <p className={styles["catefive-wrapper"]}>上午1:00</p>
                                <p className={styles["to-wrapper"]}>To</p>
                                <p className={styles["catefive-wrapper"]}>上午1:00</p>
                            </div>
                            
                            <Link to="/teacher/edit_game/bosssetting">
                                <button className={styles.button3}>Next</button>
                            </Link>
                        </div>
                        {/* <table cellPadding={5} style={{ borderCollapse: "collapse", width: "80%" }}>

                            <tr>
                                <td className={styles.title}>Bank Title:</td>
                                <td ><input id={styles.white1} type="text" name="fname" onChange={(e) => this.setState({ input: e.target.value })} /></td>

                            </tr>
                            <tr>
                                <td className={styles.title}>Category:</td>
                                
                                <td >
                                    <p className={styles["cateone-wrapper"]}>Year</p>
                                  
                                    <p className={styles["cateone-wrapper"]}>Math</p>
                                </td>
                                
                            </tr>
                            <tr>
                                <td className={styles.title}>Add group:</td>
                                <td >
                                    <p className={styles["catetwo-wrapper"]}>Class 3D</p>
                                  
                                    <p className={styles["catetwo-wrapper"]}>Class 3C</p>
                                </td>
                                
                            </tr>
                            <tr>
                                <td className={styles.title}>Date:</td>
                                <td >
                                    <p className={styles["catethree-wrapper"]}>2021年1月3日</p>
                                   
                                    <p className={styles["cateeight-wrapper"]}>To</p>
                                   
                                    <p className={styles["catethree-wrapper"]}>2021年1月3日</p>
                                </td>
                                                     
                            </tr>
                            <tr>
                                <td className={styles.title}>Time:</td>
                                <td >
                                    <p className={styles["catefive-wrapper"]}>上午1:00</p>
                                   
                                    <p className={styles["catesix-wrapper"]}>To</p>
                                 
                                    <p className={styles["cateseven-wrapper"]}>上午1:00</p>
                                </td>
                               
                          </tr>
                          
                        </table> */}






                    </div>
                </div>
            </div>
        );
    }
}





{/*render() {
        return (
            <div className={styles["flex-container"]}>
                <div>
                    <div id={styles["yellow-topbar"]}>
                        <p id={styles.add}>Add Game</p>

                    </div>
                    <div id={styles["yellow-wrapper"]}>

                        <table cellPadding="5">
                            <tr>
                                <td className={styles.title}><p className={styles.titleword}>Game Title : </p></td>
                                <td id={styles["bar-wrapper"]}><input id={styles.white1} type="text" name="fname" onChange={(e) => this.setState({ input: e.target.value })} />
                                </td>

                            </tr>





                            <tr>
                                <td className={styles.title}><p className={styles.titleword}>Category : </p></td>
                                <td id={styles["cateone-wrapper"]}>
                                    <p id={styles.year3}>Year 3</p>
                                </td>
                                <td id={styles["catetwo-wrapper"]}>
                                    <p id={styles.math}>Math</p>
                                </td>
                            </tr>




                            <tr>
                                <td className={styles.title}><p className={styles.titleword}>Add group : </p></td>
                                <td id={styles["catethree-wrapper"]}>
                                    <p id={styles.class3d}>Class 3D</p>
                                </td>
                                <td id={styles["catefour-wrapper"]}>
                                    <p id={styles.class3c}>Class 3C</p>
                                </td>
                            </tr>




                            <tr>
                                <td className={styles.title}><p className={styles.titleword}>Date : </p></td>
                                <td id={styles["catefive-wrapper"]}>
                                    <p>2021年1月3日</p>
                                </td>
                                <td id={styles["toone-wrapper"]}>
                                    <p>To</p>
                                </td>
                                <td id={styles["catesix-wrapper"]}>
                                    <p>2021年1月3日</p>
                                </td>
                            </tr>




                            <tr>
                                <td className={styles.title}><p>Time : </p></td>
                                <td id={styles["cateseven-wrapper"]}>
                                    <p>上午1:00</p>
                                </td>
                                <td id={styles["totwo-wrapper"]}>
                                    <p>To</p>
                                </td>
                                <td id={styles["cateeight-wrapper"]}>
                                    <p>上午1:00</p>
                                </td>
                            </tr>
                        </table>


                        <div id={styles.next}>
                            <Link to="/teacher/edit_game/mc">
                                <button className={styles.button3}>Next</button>
                            </Link>
                        </div>





                    </div>
                </div>




            </div>



        );
    }

}*/}
export default Quest;