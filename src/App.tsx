import { useState, useRef, useEffect, useMemo } from 'react'
import './App.scss'

const soundEffect = (fileName: string) => {
    const sound = new Audio(`/sound-effects/${fileName}.wav`);
    sound.play();
}

const random = (min: number, max: number): number => {
    return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);
}

const randomFromList = (list: any[]): any => {
  return list[random(0, list.length - 1)]
}

const fisherYates = (list: any[]): any[] => {
  let limit = list.length - 1;
  while(limit > 0) {
        let position = random(0, limit);

        let tmp = list[position];
        list[position] = list[limit];
        list[limit] = tmp;

        limit--;
  }

  return list;
}

const removeAccents = (string: string): string => {
  if (!string) return ''

  return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const normalizeString = (string: string): string => {
  if (!string) return ''

  return removeAccents(string).toLowerCase().trim();
}

const levenshteinDistance = (a: string, b: string, corte = true): number => {
  if (!a || !b) return -1

  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  a = normalizeString(a);
  b = normalizeString(b);

  if (corte) {
     if (a.length > b.length) {
      let diferenca = a.length - b.length;
      a = a.slice(0, a.length - diferenca);
     } else if (a.length < b.length) {
      let diferenca = b.length - a.length;
      b = b.slice(0, b.length - diferenca);
     }
  }

  let matrix = [];

  for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
         if (b.charAt(i - 1) == a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
         } else {
            matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
         }
      }
  }

  return matrix[b.length][a.length];
}

const inList = (value: any, list: any[]): boolean => {
  for (let i = 0; i < list.length; i++) {
    if (value === list[i])
      return true
  }

  return false
}

const atLeastOneInList = (list1: any[], list2: any[]): boolean => {
  for (let i = 0; i < list1.length; i++) {
    for (let j = 0; j < list2.length; j++) {
      if (normalizeString(list1[i]) === normalizeString(list2[j])) {
        return true
      }
    }
  }

  return false
}

// atLeastOneInList(['Europa', 'Bandeira'], ['Mapa', 'Bandeira'])

const closestElement = (value: any, list: any[], ignore: any[] = []): any => {
  let closest = Number.POSITIVE_INFINITY
  let theOne
  for (let i = 0; i < list.length; i++) {
    if (!inList(list[i], ignore)) {
      let distance = levenshteinDistance(value, list[i])
      if (distance < closest) {
        closest = distance
        theOne = list[i]
      }
    }
  }

  return theOne
}

const getListFromObjectsAttr = (objects: any[], attr: string): any[] => {
  let list = []
  for (let i = 0; i < objects.length; i++) {
    list.push(objects[i][attr])
  }
  return list
}

const generateUniqueKey = () => {
  const alphabet = fisherYates(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '!', '@', '#', '$', '%', '&', '*', '-', '_', '+', '='])
  const date = new Date()
  let key = `${date.getTime()}`
  for (let i = 0; i < 12; i++) {
    key += randomFromList(alphabet)
  }

  return key
}

const copy = (element: any): any => {
  return JSON.parse(JSON.stringify(element))
}

let ds = [
  {"id":0,"question":"Distrito Federal.png","answer":"Brasília","categories":["Sigla"],"selfSufficient":true},
  {"id":1,"question":"RN","answer":"Natal","categories":["Sigla"],"selfSufficient":true},
  {"id":2,"question":"SP","answer":"São Paulo","categories":["Sigla"],"selfSufficient":true}
]

type QuestionType = {
  id: number
  question: string
  answer: string
  categories: string[]
  selfSufficient: boolean
}

type ConfigType = {
  timePerQuestion: number
  amountOfPossibleVariations: number
  amountOfSuggestions: number
  listOfCategories: string
}

function App() {
  // mantém um valor enquanto as dependências não são modificadas
  const shuffleDataset = useRef(0)

  const dataset = useMemo(() => {
    return fisherYates(ds)
  }, [shuffleDataset])

  const allPossibleAnswers = useMemo(() => {
    return getListFromObjectsAttr(dataset, 'answer')
  }, [])

  const [questions, setQuestions] = useState(fisherYates(dataset))
  const [result, setResult] = useState(false)
  const [wasGivenAnswer, setWasGivenAnswer] = useState(false)
  const [answer, setAnswer] = useState('')
  const [timerKey, setTimerKey] = useState(0)
  const [isInitialConfigOpened, setIsInitialConfigOpened] = useState(true)
  const [questionDate, setQuestionDate] = useState(new Date())
  const [currentConfig, setCurrentConfig] = useState({
    timePerQuestion: 30,
    amountOfPossibleVariations: 2,
    amountOfSuggestions: 3,
    listOfCategories: 'Sigla'
  })
  const askedQuestions = useRef<string[]>([])
  const currentQuestion = useRef<QuestionType>()
  const [playedMatches, setPlayedMatches] = useState(0)
  const [points, setPoints] = useState(0)
  const [performance, setPerformance] = useState(0)
  const [record, setRecord] = useState(0)

  const usedTips = useRef(0)

  const totalOfSelfSufficients = useMemo(() => {
    let total = 0
    let splittedListOfCategories = currentConfig.listOfCategories.split(',')
    for (let i = 0; i < dataset.length; i++) {
      if (dataset[i].selfSufficient && atLeastOneInList(dataset[i].categories, splittedListOfCategories))
        total++
    }
    return total
  }, [currentConfig])

  useEffect(() => {
    let storedRecord = localStorage.getItem('record')
    if (!storedRecord) {
      setRecord(0)
    } else {
      setRecord(JSON.parse(storedRecord))
    }

    // let storedConfig = localStorage.getItem('config')
    // if (storedConfig) {
    //   setCurrentConfig(JSON.parse(storedConfig))
    // }
  }, [])

  useEffect(() => {
    if (points > record) {
      localStorage.setItem('record', points.toString())
      setRecord(points)
    }
  }, [points])

  const handleResetTime = () => {
    setTimerKey(timerKey + 1)
  }

  const handleMessageGivenResult = () => {
    if (!wasGivenAnswer) return

    if (result) {
      return 'You are correct!'
    } else {
      return `Oops! The answer was "${currentQuestion.current!.answer}"!`
    }
  }

  const calculatePerformance = (): number => {
    if (playedMatches === 0) return 0

    return Math.round((points / (playedMatches * 10)) * 100)
  }

  const handleNext = () => {
    if (wasGivenAnswer) {
      usedTips.current = 0
      setWasGivenAnswer(false)
      handleResetTime()
      setAnswer('')
      setQuestionDate(new Date())
      setPerformance(calculatePerformance())
    }
  }

  const handleUserAnswer = (answer: string) => {
    if (!currentQuestion.current) return

    setPlayedMatches(currentPlayedMatches => {
      return playedMatches + 1
    })

    askedQuestions.current.push(currentQuestion.current.question)

    setWasGivenAnswer(true)
    if (normalizeString(answer) === normalizeString(currentQuestion.current.answer)) {
      soundEffect('right')
      setResult(true)
      setPoints(currentPoints => {
        return currentPoints + 10 - usedTips.current
      })
    } else {
      soundEffect('wrong')
      setResult(false)
    }
  }

  const defineListOfQuestions = (): QuestionType[] => {
    let end = false, splittedListOfCategories = currentConfig.listOfCategories.split(',')
    let randomQuestion: QuestionType = questions[0]

    if (askedQuestions.current.length >= totalOfSelfSufficients)
      askedQuestions.current = []

    while(!end) {
      randomQuestion = randomFromList(questions)
      if (randomQuestion.selfSufficient && atLeastOneInList(randomQuestion.categories, splittedListOfCategories) && !inList(randomQuestion.question, askedQuestions.current))
        end = true
    }

    currentQuestion.current = randomQuestion

    let finalResult = []
    finalResult.push(randomQuestion)

    let inserted = 0
    for (let i = 0; i < dataset.length; i++) {
      if (randomQuestion.answer === dataset[i].answer && atLeastOneInList(dataset[i].categories, splittedListOfCategories) && dataset[i].id !== randomQuestion.id) {
        finalResult.push(dataset[i])
        inserted++
      }

      if (inserted >= currentConfig.amountOfPossibleVariations)
        break;
    }

    return finalResult
  }

  const handlePlay = (config: ConfigType) => {
    setCurrentConfig(config)
    // localStorage.setItem('config', JSON.stringify(config))
    setIsInitialConfigOpened(false)
    setQuestionDate(new Date())
  }
  
  const updateConfig = (changes: any) => {
    setCurrentConfig(prevCurrentConfig => ({ ...prevCurrentConfig, ...changes }))
  }

  return (
    <div className="container">
      {
        isInitialConfigOpened &&
        <InitialConfig
          onPlay={handlePlay}
          config={currentConfig}
          updateConfig={updateConfig}
        />
      }
      {
        !isInitialConfigOpened &&
        <>
          <Menu
            handleNext={handleNext}
            setIsInitialConfigOpened={setIsInitialConfigOpened}
            points={points}
            performance={performance}
            playedMatches={playedMatches}
            record={record}
          />

          {wasGivenAnswer &&
            <div className="resultMessage">
              {handleMessageGivenResult()}
            </div>
          }


          {!wasGivenAnswer &&
            <>
              <Timer
                initialDate={questionDate}
                limit={currentConfig.timePerQuestion}
                onTimeout={handleUserAnswer}
              />
              <Question
                defineListOfQuestions={defineListOfQuestions}
                usedTips={usedTips}
              />
              <UserInputs
                allPossibleAnswers={allPossibleAnswers}
                amountOfSuggestions={currentConfig.amountOfSuggestions}
                onAnswerSend={handleUserAnswer}
              />
            </>
          }
        </>
      }


    </div>
  )
}

type UserInputsProps = {
  allPossibleAnswers: string[]
  amountOfSuggestions: number,
  onAnswerSend: (answer: string) => void
}

function UserInputs({allPossibleAnswers, amountOfSuggestions, onAnswerSend}: UserInputsProps) {
  const [answer, setAnswer] = useState('')
  const suggestionsVisibility = useRef('none')

  const createSuggestions = () => {
    let suggestions = []
    let ignore = []

    for (let i = 0; i < amountOfSuggestions; i++) {
      // *ordenar as distâncias
      const currentSuggestion = closestElement(answer, allPossibleAnswers, ignore)
      suggestions.push(currentSuggestion)
      ignore.push(currentSuggestion)
    }

    suggestionsVisibility.current = 'flex'

    return suggestions
  } 

  const handleAnswerChange = (e: any) => {
    setAnswer(e.target.value)
  }

  const handleSuggestionSelect = (suggestion: string) => {
    setAnswer(suggestion)
  }

  const handleAnswerSend = () => {
    onAnswerSend(answer)
  }

  return (
    <>
      <div className="suggestions" style={{display: suggestionsVisibility.current}}>
        <Suggestions
          listOfSuggestions={createSuggestions()}
          onSuggestionSelect={handleSuggestionSelect} 
        />
      </div>
      <Answer
        onSend={handleAnswerSend}
        onChange={handleAnswerChange}
        answer={answer}
      />
    </>
  )
}




type InitialConfigProps = {
  onPlay: (config: ConfigType) => void
  updateConfig: (changes: any) => void
  config: ConfigType
}

function InitialConfig({onPlay, updateConfig, config}: InitialConfigProps) {
  return (
    <div className="initialConfig">
      <h1>Better Quiz</h1>
      <h2>Configuration</h2>
      <label htmlFor="timePerQuestion">Time per question (in seconds): </label>
      <input onChange={(e) => updateConfig({timePerQuestion: e.target.value})} type="number" id="timePerQuestion" defaultValue={config.timePerQuestion}/>
      <label htmlFor="amountOfPossibleVariations">Amount of possible variations: </label>
      <input onChange={(e) => updateConfig({amountOfPossibleVariations: e.target.value})} type="number" id="amountOfPossibleVariations" defaultValue={config.amountOfPossibleVariations}/>
      <label htmlFor="amountOfSuggestions">Amount of suggestions:</label>
      <input onChange={(e) => updateConfig({amountOfSuggestions: e.target.value})} type="number" id="amountOfSuggestions" defaultValue={config.amountOfSuggestions}/>
      <label htmlFor="includedCategories">Included categories: </label>
      <textarea onChange={(e) => updateConfig({listOfCategories: e.target.value})} style={{height: "100px"}} spellCheck="false" id="includedCategories" defaultValue={config.listOfCategories}></textarea>  

      <button onClick={ () => onPlay(config) }>Play</button>
    </div>
  )
}

type MenuProps = {
  handleNext: () => void
  setIsInitialConfigOpened: (isInitialConfigOpened: boolean) => void
  playedMatches: number
  points: number
  performance: number
  record: number
}

function Menu({handleNext, setIsInitialConfigOpened, playedMatches, points, performance, record}: MenuProps) {
  return (
    <div className="menu">
      <button onClick={ () => { setIsInitialConfigOpened(true) }}><i className="bi bi-gear"></i></button>
      <button>{playedMatches} <i className="bi bi-check-all"></i></button>
      <button>{points} <i className="bi bi-star"></i></button>
      <button>{performance} <i className="bi bi-percent"></i></button>
      <button>{record} <i className="bi bi-award"></i></button>
      <button onClick={ handleNext }><i className="bi bi-arrow-right"></i></button>
    </div>
  )
}

function Slider({elements, usedTips}: any) {
  const [activeElement, setActiveElement] = useState(0)
  const [activeBulletPoint, setActiveBulletPoint] = useState(0)

  const getActiveElement = () => {
    return elements[activeElement]
  }

  const updateActiveElement = (e: any) => {
    usedTips.current++
    let newIndex = parseInt(e.target.getAttribute('id'))
    setActiveElement(newIndex)
    setActiveBulletPoint(newIndex)
  }

  const getControls = () => {
    return elements.map((element: any, index: number) => {
      if (index === activeBulletPoint) {
        return <div key={index} id={index.toString()} onClick={updateActiveElement} style={{width: '1rem', height: '1rem', borderRadius: '50%', backgroundColor: '#fff', cursor: 'pointer', marginRight: '1rem'}}></div>
      } else {
        return <div key={index} id={index.toString()} onClick={updateActiveElement} style={{width: '1rem', height: '1rem', borderRadius: '50%', backgroundColor: '#555', cursor: 'pointer', marginRight: '1rem'}}></div>       
      }
    })
  }

  return (
    <div className="question">
      {getActiveElement()}
      <div className="controls" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2rem'}}>
        {elements.length > 1 ? getControls() : ''}
      </div>
    </div>
  )
}

type QuestionProps = {
  defineListOfQuestions: () => QuestionType[]
  usedTips: any
}

function Question({ defineListOfQuestions, usedTips }: QuestionProps) {
  const listOfQuestions = defineListOfQuestions()

  if (!listOfQuestions) return <div></div>

  const questionType = (currentQuestion: QuestionType) => {
    if (currentQuestion.question.search('jpg') !== -1 || currentQuestion.question.search('png') !== -1) {
      return <img key={generateUniqueKey()} src={currentQuestion.question}/>
    } else if (currentQuestion.question.search('mp3') !== -1 || currentQuestion.question.search('ogg') !== -1) {
      return (
        <audio key={generateUniqueKey()} controls={true}>
          <source src={currentQuestion.question} type="audio/ogg"/>
          <source src={currentQuestion.question} type="audio/ogg"/>
          Your browser doesn't support the audio tag.
        </audio>
      )
    } else {
      return <div className="textualQuestion" key={generateUniqueKey()}>{currentQuestion.question}</div>
    }
  }

  const createElements = () => {
    return listOfQuestions.map(currentQuestion => {
      return questionType(currentQuestion)
    })
  }

  return (
    <Slider elements={createElements()} usedTips={usedTips}/>
  )
}

type SuggestionsProps = {
  listOfSuggestions: string[]
  onSuggestionSelect: (suggestion: string) => void
}

function Suggestions({listOfSuggestions, onSuggestionSelect}: SuggestionsProps) {
  return (
    <>
    {
      listOfSuggestions.map((suggestion, index) => {
        return <div key={index} onClick={ () => onSuggestionSelect(suggestion)}>{suggestion}</div>
      })
    }
    </>
  )
}

type AnswerProps = {
  onSend: () => void
  onChange: (e: any) => void
  answer: string
}

function Answer({onSend, onChange, answer}: AnswerProps) {
  return (
    <div className="answer">
      <input onChange = {onChange} value={answer} type="text" placeholder="Answer"/>
      <button onClick={ () => onSend() }><i className="bi bi-send"></i></button>
    </div>
  )
}

type TimerProps = {
  initialDate: Date
  limit: number,
  onTimeout: (answer: string) => void
}

function Timer({initialDate, limit, onTimeout}: TimerProps) {
  const [remainingTime, setRemainingTime] = useState(limit)

  useEffect(() => {
    const interval = setInterval(() => {
      let now = new Date()
      let newRemainingTime = Math.ceil(limit - ((now.getTime() - initialDate.getTime()) / 1000))
      if (newRemainingTime <= 0) {
        onTimeout('')
        clearInterval(interval)
      } else {
        setRemainingTime(newRemainingTime)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [initialDate, remainingTime])

  return <div className="timer">{remainingTime} <i className="bi bi-hourglass-split"></i></div>
}

export default App