import React, { useState, useRef } from 'react';
import {
	Dimensions,
	StyleSheet,
	TouchableOpacity,
	View,
	StatusBar,
	Text,
	Image,
	ActivityIndicator,
	ScrollView,
	NativeModules
} from 'react-native';
import { Asset } from 'expo-asset';
import {
	ViroARScene,
	ViroARSceneNavigator,
	ViroSphere,
	ViroSpinner,
	ViroFlexView,
	ARInitializationUI,
	ViroARImageMarker,
	ViroARTrackingTargets,
	ViroBox,
	ViroConstants,
	Viro360Image
} from "@viro-community/react-viro";
import { Camera } from 'expo-camera';
import ImgToBase64 from 'react-native-image-base64';
import PanoramaView from "@lightbase/react-native-panorama-view";



import OpenCV from "./OpenCV"

const { height, width } = Dimensions.get("window");
const centerX = width / 2,
	centerY = height / 2;

function round(n) {
	if (!n) {
		return 0;
	}

	return Math.floor(n * 100) / 100;
}

let TEST_PHOTOS: PictureData[] = [
	{
		index: 0,
		imgPath: require('./assets/image1.jpg')
	},
	{
		index: 1,
		imgPath: require('./assets/image2.jpg')
	},
	{
		index: 2,
		imgPath: require('./assets/image3.jpg')
	},
	{
		index: 3,
		imgPath: require('./assets/image4.jpg')
	},
	{
		index: 4,
		imgPath: require('./assets/image5.jpg')
	},
	{
		index: 5,
		imgPath: require('./assets/image6.jpg')
	},
]

type PointPosition = {
	position: number[]
	rotation: number[]
}
type PictureData = {
	index: number
	imgPath: string
}
type ARCameraData = {

	cameraTransform:
	{
		forward: number[]
		position: number[]
		rotation: number[]
		up: number[]
	},
	forward: number[]
	position: number[]
	rotation: number[]
	up: number[]
}
// const paths  = [
//   { position: [0, 0, -5], rotation: [0, 0, 0] },
// 	// { position: [1.5, 0, -5], rotation: [0, -25, 0] },
// 	{ position: [2.5, 0, -5], rotation: [0, -25, 0] },
// 	// { position: [3.5, 0, -5], rotation: [0, -43, 0] },
// 	{ position: [5, 0, -5], rotation: [0, -43, 0] },
// 	// { position: [5, 0, -3.5], rotation: [0, -60, 0] },
// 	{ position: [5, 0, -2.5], rotation: [0, -60, 0] },
// 	// { position: [5, 0, -1.5], rotation: [0, -60, 0] },
// 	{ position: [5, 0, 0], rotation: [30, 85, 45] },
// 	// { position: [5, 0, 1.5], rotation: [30, 85, 45] },
// 	{ position: [5, 0, 2.5], rotation: [176, -64, -170] },
// 	// { position: [5, 0, 3.5], rotation: [180, 0, -174] },
// 	{ position: [5, 0, 5], rotation: [180, 0, -174] },
// 	// { position: [3.5, 0, 5], rotation: [180, 0, -174] },
// 	{ position: [2.5, 0, 5], rotation: [175, -48, 0] },
// 	// { position: [1.5, 0, 5], rotation: [175, -48, 0] },
// 	{ position: [0, 0, 5], rotation: [-60, 0, 0] },
// 	// { position: [-1.5, 0, 5], rotation: [-90, 0, 0] },
// 	{ position: [-2.5, 0, 5], rotation: [-90, 0, 0] },
// 	// { position: [-3.5, 0, 5], rotation: [-90, 0, 0] },
// 	{ position: [-5, 0, 5], rotation: [-120, 0, 0] },
// 	// { position: [-5, 0, 3.5], rotation: [-150, 0, 0] },
// 	{ position: [-5, 0, 2.5], rotation: [-150, 0, 0] },
// 	// { position: [-5, 0, 1.5], rotation: [-150, 0, 0] },
// 	{ position: [-5, 0, 0], rotation: [-180, 0, 0] },
// 	// { position: [-5, 0, -1.5], rotation: [0, 0, 0] },
// 	{ position: [-5, 0, -2.5], rotation: [0, 0, 0] },
// 	// { position: [-5, 0, -3.5], rotation: [0, 0, 0] },
// 	{ position: [-5, 0, -5], rotation: [0, 0, 0] },
// 	// { position: [-3.5, 0, -5], rotation: [0, 0, 0] },
// 	{ position: [-2.5, 0, -5], rotation: [0, 0, 0] }
// ]


const PATH_POSITIONS = [
	{ position: [0, 0, -5], rotation: [0, 0, 0] },
	{ position: [1.5, 0, -5], rotation: [0, -25, 0] },
	{ position: [2.5, 0, -5], rotation: [0, -25, 0] },
	{ position: [3.5, 0, -5], rotation: [0, -43, 0] },
	{ position: [5, 0, -5], rotation: [0, -43, 0] },
	{ position: [5, 0, -3.5], rotation: [0, -60, 0] },
	{ position: [5, 0, -2.5], rotation: [0, -60, 0] },
	{ position: [5, 0, -1.5], rotation: [0, -60, 0] },
	{ position: [5, 0, 0], rotation: [30, 85, 45] },
	{ position: [5, 0, 1.5], rotation: [30, 85, 45] },
	{ position: [5, 0, 2.5], rotation: [176, -64, -170] },
	{ position: [5, 0, 3.5], rotation: [180, 0, -174] },
	{ position: [5, 0, 5], rotation: [180, 0, -174] },
	{ position: [3.5, 0, 5], rotation: [180, 0, -174] },
	{ position: [2.5, 0, 5], rotation: [175, -48, 0] },
	{ position: [1.5, 0, 5], rotation: [175, -48, 0] },
	{ position: [0, 0, 5], rotation: [-60, 0, 0] },
	{ position: [-1.5, 0, 5], rotation: [-90, 0, 0] },
	{ position: [-2.5, 0, 5], rotation: [-90, 0, 0] },
	{ position: [-3.5, 0, 5], rotation: [-90, 0, 0] },
	{ position: [-5, 0, 5], rotation: [-120, 0, 0] },
	{ position: [-5, 0, 3.5], rotation: [-150, 0, 0] },
	{ position: [-5, 0, 2.5], rotation: [-150, 0, 0] },
	{ position: [-5, 0, 1.5], rotation: [-150, 0, 0] },
	{ position: [-5, 0, 0], rotation: [-180, 0, 0] },
	{ position: [-5, 0, -1.5], rotation: [0, 0, 0] },
	{ position: [-5, 0, -2.5], rotation: [0, 0, 0] },
	{ position: [-5, 0, -3.5], rotation: [0, 0, 0] },
	{ position: [-5, 0, -5], rotation: [0, 0, 0] },
	{ position: [-3.5, 0, -5], rotation: [0, 0, 0] },
	{ position: [-2.5, 0, -5], rotation: [0, 0, 0] }
]

let cameraTimeout: NodeJS.Timeout | null = null
let isStarted = false;
let currentPosition: PointPosition = PATH_POSITIONS[0]
let loading = false
let showPoint = true;

export default function App() {

	const [imgData, setImgData] = useState<PictureData[]>([]);
	const [message, setMessage] = useState('') // TODO: put back false
	const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0)
	const [writeAccessPermission, setWriteAccessPermission] = useState<boolean>(false)
	const [viewMode, setViewMode] = useState<boolean>(false)
	const [panoImage, setPanoImage] = useState<string | null>(null)
	const [processing, setProcessing] = useState<boolean>(false)

	const ARNavigator = useRef()

	// React.useEffect(() => {
	// 	loadTestPhotos()
	// }, [])

	// const loadTestPhotos = async () => {
	// 	for (let i = 0; i < TEST_PHOTOS.length; i++) {
	// 		const uri = Asset.fromModule(TEST_PHOTOS[i].imgPath).uri;
	// 		console.log('uri', uri)
	// 		TEST_PHOTOS[i].imgPath = uri
	// 	}
	// 	console.log('TEST_PHOTOS', TEST_PHOTOS)
	// 	alert('test images are ready')
	// }

	// Effect: start photo taking process 
	const startTakingPhotos = () => {
		currentPosition = PATH_POSITIONS[0];
		// setShowPoint(true)
		isStarted = !isStarted
	}

	const handleCameraMovement = (data: ARCameraData) => {
		// console.log('camera rotation=====', data.rotation);
		if (!cameraTimeout && isStarted) {
			cameraTimeout = setTimeout(() => {
				if (!loading) {
					if (isPointTargeted(data.rotation, currentPosition.rotation)) {
						// console.log('inside if =======')
						loading = true
						takePicture()
						// Take picture
					} else {
						// console.log('inside else =======')
						loading = false
					}
					cameraTimeout = null
				}
			}, 500);
		}
	}

	const takePicture = async () => {
		// await stitchPhotos(TEST_PHOTOS);
		// return // TODO: remove this
		loading = true;
		setMessage("Don't Move")
		if (currentPhotoIndex < PATH_POSITIONS.length - 1) {
			showPoint = false
			currentPosition = PATH_POSITIONS[currentPhotoIndex + 1]
			setCurrentPhotoIndex(currentPhotoIndex + 1);
		};
		setTimeout(async() => {
			const currentImagePath = await takeScreenshot()
			showPoint = true
			const pictureData: PictureData = { index: currentPhotoIndex, imgPath: currentImagePath };
			const newPhotosData = [...imgData];
			newPhotosData.push(pictureData);
			setImgData(newPhotosData)
			if (currentPhotoIndex === PATH_POSITIONS.length - 1) {
				// loading = (false)
				setMessage("Processing Photos...")
				await stitchPhotos(newPhotosData)
			} else {
				loading = false
				setMessage("Rotate right...")
			}
		}, 300)

	}

	const takeScreenshot = async () => {
		// check for write permissions, if not then request
		// if (writeAccessPermission) {
		// 	requestWriteAccessPermission();
		// }

		return ARNavigator.current._takeScreenshot("pano_" + currentPhotoIndex, false).then((retDict) => {
			if (!retDict.success) {
				if (retDict.errorCode == ViroConstants.RECORD_ERROR_NO_PERMISSION) {
					alert("Please allow camera permissions!" + retDict.errorCode);
					return false
				}
			} else {
				const imageUrl = "file://" + retDict.url;
				console.log('imageUrl', imageUrl)
				return imageUrl
			}
		});
	}



	const stitchPhotos = async (photosData: PictureData[]) => {
		setProcessing(true)
		try {
			const images64BaseArray: string[] = await get64BasedImages(photosData);

			const stitchingResult = await OpenCV.stitchImages(images64BaseArray);
			console.log('stitchingResult$$$$$$$$$$$', stitchingResult);
			if (stitchingResult) {
				setMessage("")
				setPanoImage(stitchingResult)
				setViewMode(true)
				// ARNavigator.current.push({ scene: PanoramicScene }) 
			}
		} catch (error) {
			console.log(error)
		}
		loading = false
	}

	const get64BasedImages = async (photosData: PictureData[]) => {
		const imagesBased64: string[] = [];
		let base64Image;
		for (const photoData of photosData) {
			base64Image = await ImgToBase64.getBase64String(photoData.imgPath)
			imagesBased64.push(base64Image)
		}
		return imagesBased64;
	}

	const isPointTargeted = (cameraRotation: number[], arPointCirclePosition: number[]) => {
		if (isEqual(cameraRotation[0], arPointCirclePosition[0]) && isEqual(cameraRotation[1], arPointCirclePosition[1])) {
			return true
		} else {
			return false
		}
	}

	const isEqual = (firstValue: number, secondValue: number): boolean => {
		const diff = Math.abs(firstValue) - Math.abs(secondValue);
		// console.log("diff", diff)
		return (Math.abs(diff)) < 10 // TODO: handle  minus value
	}

	const renderIf = (condition: boolean, content: JSX.Element) => {
		if (condition) {
			return content
		} else {
			return null
		}
	}



	const MainScene = () => {
		return (
			<ViroARScene >
				<ViroSpinner visible={loading} position={currentPosition.position} onFuse={(source: any) => console.log('hovering=========', source)} />
				{renderIf(!viewMode, <ViroSphere
					heightSegmentCount={20}
					widthSegmentCount={20}
					radius={0.1}
					position={currentPosition.position}
					visible={showPoint}
				// materials={["m"]}
				/>)}
				{/* <ViroARImageMarker target={"cameraTarget"} onAnchorFound={takePicture}>
					<ViroSphere position={currentPosition.position} scale={[.5, .5, .5]} />
				</ViroARImageMarker> */}

				{renderIf(viewMode, <Viro360Image
					source={{ uri: `data:image/gif;base64,${panoImage}` }}
					rotation={[0, 45, 0]}
					format="RGBA8"
				// onLoadStart={this._onLoadStart}
				// onLoadEnd={this._onLoadEnd}
				// onError={this._onError} 
				/>)}

			</ViroARScene >
		)
	}

	const PanoramicScene = () => {
		return (
			<ViroARScene >
				<Viro360Image
					source={{ uri: `data:image/png;base64,${panoImage}` }}
					rotation={[0, 45, 0]}
					format="RGBA8"
				// onLoadStart={this._onLoadStart}
				// onLoadEnd={this._onLoadEnd}
				// onError={this._onError} 
				/>
			</ViroARScene>
		)
	}

	const panoView =
		<ScrollView horizontal>
			<Image source={{ uri: `data:image/png;base64,${panoImage}` }} style={{ height: height, width: width * 5 }} resizeMode="contain" />
		</ScrollView>
	const arView =

		!processing ?
			<>
				<ViroARSceneNavigator initialScene={{ scene: MainScene }} ref={ARNavigator} hdrEnabled={false} />

				<><View style={styles.pathFinder} />
					<View style={styles.messageContainer}>
						<Text style={styles.message}>{message}</Text>
						{renderIf(loading, <ActivityIndicator color='#fff' />)}
					</View>
					<TouchableOpacity style={styles.trigger} onPress={takePicture}>
						<Image source={require('./assets/camera.png')} resizeMode='contain' style={styles.iconStyle} />
					</TouchableOpacity></>
			</> :
			<View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator color='#fff' />
			</View>

	return (
		<View style={{ flex: 1 }}>
			<StatusBar hidden={true} />
			{viewMode ? panoView : arView}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},

	pathFinder: {
		position: 'absolute',
		height: 40,
		width: 40,
		top: height / 2 - 30,
		left: width / 2 - 30,
		borderRadius: 100,
		borderWidth: 2,
		borderColor: 'yellow'
	},
	messageContainer: {
		position: 'absolute',
		// height: 60,
		// width: 60,
		// top: height / 1.5,
		left: width / 2 - 30,
	},
	message: {
		color: '#fff',
		marginVertical: 10
	},
	trigger: {
		position: 'absolute',
		justifyContent: 'center',
		alignItems: 'center',
		top: height - 80,
		left: width / 2 - 35,
		height: 70,
		width: 70,
		backgroundColor: 'red',
		borderRadius: 75,
		borderColor: 'black',
		borderWidth: 1
	},
	iconStyle: {
		height: 30,
		width: 30,
		tintColor: '#fff'
	}
	// path: {
	// 	position: 'absolute',
	// 	left: 150,
	// 	right: 150,
	// 	width: '100%'
	// },
	// pathPoint: {
	// 	height: 15,
	// 	width: 15,
	// 	marginHorizontal: 20
	// }
});

